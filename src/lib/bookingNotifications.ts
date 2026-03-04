import { units } from "@/data/units";

type NotificationStatus = "sent" | "skipped" | "failed";

export type NotificationResult = {
    ok: boolean;
    status: NotificationStatus;
    provider?: string;
    error?: string;
};

export type BookingNotificationPayload = {
    id: string;
    unitSlug: string;
    serviceName: string;
    date: string;
    time: string;
    patientName: string;
    email: string;
    whatsapp: string;
};

function unitFromSlug(slug: string) {
    return units.find((u) => u.slug === slug);
}

function unitLabelFromSlug(slug: string): string {
    const unit = unitFromSlug(slug);
    return unit?.name ?? slug;
}

function unitEmailFromSlug(slug: string): string | null {
    const unit = unitFromSlug(slug);
    const raw = (unit?.email ?? "").trim();
    if (!raw) return null;
    return raw.replace(/^mailto:/i, "").split("?")[0]?.trim() || null;
}

function formatDatePtBr(dateKey: string): string {
    const [y, m, d] = dateKey.split("-").map((x) => Number(x));
    if (!y || !m || !d) return dateKey;
    return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

function buildEmailText(payload: BookingNotificationPayload) {
    const unitLabel = unitLabelFromSlug(payload.unitSlug);
    const dateLabel = formatDatePtBr(payload.date);
    return [
        `Olá, ${payload.patientName}!`,
        "",
        "Sua reserva foi confirmada.",
        "",
        `Procedimento: ${payload.serviceName}`,
        `Data: ${dateLabel} às ${payload.time}`,
        `Unidade: ${unitLabel}`,
        `Protocolo: ${payload.id}`,
        "",
        "Se precisar alterar, responda este e-mail.",
        "",
        "Espaço Facial",
    ].join("\n");
}

function buildEmailHtml(payload: BookingNotificationPayload) {
    const unitLabel = unitLabelFromSlug(payload.unitSlug);
    const dateLabel = formatDatePtBr(payload.date);
    return `
        <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
            <p>Olá, <strong>${payload.patientName}</strong>!</p>
            <p>Sua reserva foi confirmada.</p>
            <p><strong>Procedimento:</strong> ${payload.serviceName}<br/>
               <strong>Data:</strong> ${dateLabel} às ${payload.time}<br/>
               <strong>Unidade:</strong> ${unitLabel}<br/>
               <strong>Protocolo:</strong> ${payload.id}</p>
            <p>Se precisar alterar, responda este e-mail.</p>
            <p>Espaço Facial</p>
        </div>
    `.trim();
}

function buildWhatsappMessage(payload: BookingNotificationPayload) {
    const unitLabel = unitLabelFromSlug(payload.unitSlug);
    const dateLabel = formatDatePtBr(payload.date);
    return `Reserva confirmada! ${payload.patientName}, seu agendamento de ${payload.serviceName} em ${dateLabel} às ${payload.time} na ${unitLabel} foi confirmado. Protocolo ${payload.id}.`;
}

async function postJson(url: string, body: unknown, headers?: Record<string, string>) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4_000);
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "content-type": "application/json", ...(headers ?? {}) },
            body: JSON.stringify(body),
            signal: controller.signal,
        });
        return { ok: res.ok, status: res.status, text: await res.text().catch(() => "") };
    } catch (error) {
        return { ok: false, status: 0, text: error instanceof Error ? error.message : "request_failed" };
    } finally {
        clearTimeout(timeout);
    }
}

export async function sendBookingEmail(payload: BookingNotificationPayload): Promise<NotificationResult> {
    const to = payload.email;
    const envFrom = (process.env.BOOKING_EMAIL_FROM ?? "").trim();
    const unitFrom = unitEmailFromSlug(payload.unitSlug) ?? "";
    const from = envFrom || unitFrom;
    const resendKey = (process.env.RESEND_API_KEY ?? "").trim();
    const webhookUrl = (process.env.BOOKING_EMAIL_WEBHOOK_URL ?? "").trim();

    if (!to) return { ok: false, status: "skipped", error: "missing_to" };
    if (resendKey && from) {
        const res = await postJson(
            "https://api.resend.com/emails",
            {
                from,
                to,
                subject: "Confirmação de agendamento — Espaço Facial",
                html: buildEmailHtml(payload),
                text: buildEmailText(payload),
            },
            { Authorization: `Bearer ${resendKey}` },
        );
        return res.ok
            ? { ok: true, status: "sent", provider: "resend" }
            : { ok: false, status: "failed", provider: "resend", error: res.text || "send_failed" };
    }

    if (webhookUrl) {
        const secret = (process.env.BOOKING_EMAIL_WEBHOOK_SECRET ?? "").trim();
        const res = await postJson(
            webhookUrl,
            {
                to,
                from,
                subject: "Confirmação de agendamento — Espaço Facial",
                text: buildEmailText(payload),
                html: buildEmailHtml(payload),
                bookingId: payload.id,
                unitSlug: payload.unitSlug,
            },
            secret ? { "x-booking-webhook-secret": secret } : undefined,
        );
        return res.ok
            ? { ok: true, status: "sent", provider: "webhook" }
            : { ok: false, status: "failed", provider: "webhook", error: res.text || "send_failed" };
    }

    return { ok: false, status: "skipped", error: "not_configured" };
}

export async function sendBookingWhatsappPrep(payload: BookingNotificationPayload): Promise<NotificationResult> {
    const webhookUrl = (process.env.BOOKING_WHATSAPP_WEBHOOK_URL ?? "").trim();
    if (!webhookUrl) return { ok: false, status: "skipped", error: "not_configured" };

    const secret = (process.env.BOOKING_WHATSAPP_WEBHOOK_SECRET ?? "").trim();
    const res = await postJson(
        webhookUrl,
        {
            to: payload.whatsapp,
            message: buildWhatsappMessage(payload),
            bookingId: payload.id,
            unitSlug: payload.unitSlug,
        },
        secret ? { "x-booking-webhook-secret": secret } : undefined,
    );

    return res.ok
        ? { ok: true, status: "sent", provider: "webhook" }
        : { ok: false, status: "failed", provider: "webhook", error: res.text || "send_failed" };
}

export async function sendBookingNotifications(payload: BookingNotificationPayload) {
    const [email, whatsapp] = await Promise.all([sendBookingEmail(payload), sendBookingWhatsappPrep(payload)]);
    return { email, whatsapp };
}
