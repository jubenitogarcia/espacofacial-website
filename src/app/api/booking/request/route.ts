import { NextResponse } from "next/server";
import { getBookingDb, nowMs, addMinutes, clampText, normalizePhone, sanitizeOneLine, isValidDateKey, isValidTimeKey, toSaoPauloIso, slugify } from "@/lib/bookingDb";
import { getServiceById } from "@/data/services";
import { signBookingDecision } from "@/lib/bookingSecurity";

export const dynamic = "force-dynamic";

type Payload = {
    unitSlug?: string;
    doctorSlug?: string;
    doctorName?: string;
    serviceId?: string;
    durationMinutes?: number;
    includes?: { avaliacao?: boolean; procedimento?: boolean; revisao?: boolean };
    date?: string; // YYYY-MM-DD
    time?: string; // HH:MM
    patientName?: string;
    whatsapp?: string;
    notes?: string;
};

function json(data: unknown, init?: ResponseInit) {
    return NextResponse.json(data, init);
}

function uuid(): string {
    const anyCrypto = globalThis as unknown as { crypto?: { randomUUID?: () => string } };
    if (anyCrypto.crypto?.randomUUID) return anyCrypto.crypto.randomUUID();
    return `req_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function getSiteUrl(request: Request): string {
    const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
    if (fromEnv) return fromEnv.replace(/\/$/, "");
    const url = new URL(request.url);
    return url.origin;
}

async function tryPostWebhook(payload: unknown) {
    const url = (process.env.BOOKING_WEBHOOK_URL ?? "").trim();
    if (!url) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4_000);
    try {
        await fetch(url, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                ...(process.env.BOOKING_WEBHOOK_SECRET ? { "x-booking-webhook-secret": process.env.BOOKING_WEBHOOK_SECRET } : null),
            } as Record<string, string>,
            body: JSON.stringify(payload),
            signal: controller.signal,
        });
    } catch {
        // Best-effort: webhook failures should not break booking creation.
    } finally {
        clearTimeout(timeout);
    }
}

async function expireStaleOverlaps(db: Awaited<ReturnType<typeof getBookingDb>>, overlaps: Array<{ id: string; status: string; confirm_by_ms: number }>) {
    const now = nowMs();
    for (const o of overlaps) {
        const status = (o.status ?? "").toString();
        if (status !== "pending" && status !== "needs_approval") continue;
        const confirmBy = Number(o.confirm_by_ms ?? 0);
        if (now <= confirmBy) continue;
        await db
            .prepare(
                "UPDATE booking_requests SET status = 'expired', decided_at_ms = ?, decision_note = COALESCE(decision_note, 'auto_expired') WHERE id = ? AND (status = 'pending' OR status = 'needs_approval')",
            )
            .bind(now, o.id)
            .run();
    }
}

export async function POST(request: Request) {
    let body: Payload;
    try {
        body = (await request.json()) as Payload;
    } catch {
        return json({ ok: false, error: "invalid_json" }, { status: 400 });
    }

    const unitSlug = sanitizeOneLine(body.unitSlug ?? "");
    const doctorSlugRaw = sanitizeOneLine(body.doctorSlug ?? "");
    const doctorName = sanitizeOneLine(body.doctorName ?? "");
    const serviceId = sanitizeOneLine(body.serviceId ?? "");
    const durationMinutesRaw = typeof body.durationMinutes === "number" ? body.durationMinutes : Number(body.durationMinutes ?? NaN);
    const date = sanitizeOneLine(body.date ?? "");
    const time = sanitizeOneLine(body.time ?? "");

    const patientName = clampText(sanitizeOneLine(body.patientName ?? ""), 80);
    const whatsapp = normalizePhone(body.whatsapp ?? "");

    // Optional field, but avoid sensitive prompts.
    const notes = clampText((body.notes ?? "").trim(), 300) || null;

    if (!unitSlug || !doctorSlugRaw || !serviceId || !date || !time) {
        return json({ ok: false, error: "missing_fields" }, { status: 400 });
    }

    if (unitSlug !== "barrashoppingsul" && unitSlug !== "novo-hamburgo") {
        return json({ ok: false, error: "invalid_unit" }, { status: 400 });
    }

    if (!isValidDateKey(date) || !isValidTimeKey(time)) {
        return json({ ok: false, error: "invalid_datetime" }, { status: 400 });
    }

    if (!patientName) {
        return json({ ok: false, error: "missing_name" }, { status: 400 });
    }

    if (!whatsapp) {
        return json({ ok: false, error: "invalid_whatsapp" }, { status: 400 });
    }

    const service = getServiceById(serviceId);
    if (!service) {
        return json({ ok: false, error: "invalid_service" }, { status: 400 });
    }

    if (!Number.isFinite(durationMinutesRaw)) {
        return json({ ok: false, error: "missing_duration" }, { status: 400 });
    }
    const durationMinutes = Math.round(durationMinutesRaw);
    if (durationMinutes <= 0 || durationMinutes > 180 || durationMinutes % 15 !== 0) {
        return json({ ok: false, error: "invalid_duration" }, { status: 400 });
    }

    const doctorSlug = doctorSlugRaw || (doctorName ? slugify(doctorName) : "");
    if (!doctorSlug) {
        return json({ ok: false, error: "invalid_doctor" }, { status: 400 });
    }

    const startIso = toSaoPauloIso(date, time);
    const startAtMs = Date.parse(startIso);
    if (!Number.isFinite(startAtMs)) {
        return json({ ok: false, error: "invalid_start" }, { status: 400 });
    }

    const endAtMs = addMinutes(startAtMs, durationMinutes);
    const createdAtMs = nowMs();
    const confirmByMs = addMinutes(createdAtMs, 60); // must be confirmed within 1h

    if (startAtMs < createdAtMs) {
        return json({ ok: false, error: "start_in_past" }, { status: 400 });
    }

    const db = await getBookingDb();

    // Check overlaps for the same unit+doctor.
    const overlapsRes = await db
        .prepare(
            "SELECT id, status, confirm_by_ms, start_at_ms, end_at_ms FROM booking_requests WHERE unit_slug = ? AND doctor_slug = ? AND start_at_ms < ? AND end_at_ms > ?",
        )
        .bind(unitSlug, doctorSlug, endAtMs, startAtMs)
        .all<{ id: string; status: string; confirm_by_ms: number; start_at_ms: number; end_at_ms: number }>();

    await expireStaleOverlaps(db, overlapsRes.results);

    const now = nowMs();
    const activeOverlaps = overlapsRes.results.filter((o) => {
        const status = (o.status ?? "").toString();
        if (status === "confirmed") return true;
        if (status === "pending" || status === "needs_approval") {
            return now <= Number(o.confirm_by_ms ?? 0);
        }
        return false;
    });

    const hasConfirmedConflict = activeOverlaps.some((o) => (o.status ?? "").toString() === "confirmed");
    const hasPendingConflict = activeOverlaps.some((o) => {
        const status = (o.status ?? "").toString();
        return status === "pending" || status === "needs_approval";
    });

    if (hasPendingConflict) {
        return json({ ok: false, error: "slot_in_review" }, { status: 409 });
    }

    const status = hasConfirmedConflict ? "needs_approval" : "pending";

    const id = uuid();

    const safeDoctorName = clampText(doctorName || doctorSlug, 120);

    const siteUrl = getSiteUrl(request);
    const decisionSecret = (process.env.BOOKING_DECISION_SECRET ?? "").trim();
    const decisionExpMs = confirmByMs;

    const decisionLinks = decisionSecret
        ? {
            confirm: `${siteUrl}/api/booking/decision?id=${encodeURIComponent(id)}&action=confirm&exp=${decisionExpMs}&override=0&sig=${encodeURIComponent(
                await signBookingDecision({ secret: decisionSecret, id, action: "confirm", expMs: decisionExpMs, overrideConflict: false }),
            )}`,
            confirmOverride: `${siteUrl}/api/booking/decision?id=${encodeURIComponent(id)}&action=confirm&exp=${decisionExpMs}&override=1&sig=${encodeURIComponent(
                await signBookingDecision({ secret: decisionSecret, id, action: "confirm", expMs: decisionExpMs, overrideConflict: true }),
            )}`,
            decline: `${siteUrl}/api/booking/decision?id=${encodeURIComponent(id)}&action=decline&exp=${decisionExpMs}&override=0&sig=${encodeURIComponent(
                await signBookingDecision({ secret: decisionSecret, id, action: "decline", expMs: decisionExpMs, overrideConflict: false }),
            )}`,
        }
        : null;

    // Optional: notify external automation via webhook (WhatsApp integration etc.)
    void tryPostWebhook({
        event: "booking.created",
        booking: {
            id,
            status,
            unitSlug,
            doctorSlug,
            doctorName: safeDoctorName,
            durationMinutes,
            includes: body.includes ?? null,
            service: { id: service.id, name: service.name },
            startAtMs,
            endAtMs,
            confirmByMs,
            patientName,
            whatsapp,
            notes,
        },
        decisionLinks,
    });

    try {
        await db
            .prepare(
                "INSERT INTO booking_requests (id, unit_slug, doctor_slug, service_id, start_at_ms, end_at_ms, status, patient_name, whatsapp, notes, created_at_ms, confirm_by_ms, decided_at_ms, decided_by, decision_note, override_conflict) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, 0)",
            )
            .bind(
                id,
                unitSlug,
                doctorSlug,
                serviceId,
                startAtMs,
                endAtMs,
                status,
                patientName,
                whatsapp,
                notes,
                createdAtMs,
                confirmByMs,
            )
            .run();
    } catch (e) {
        const msg = e instanceof Error ? e.message : "insert_failed";
        return json({ ok: false, error: "db_error", message: msg }, { status: 500 });
    }

    return json(
        {
            ok: true,
            id,
            status,
            confirmByMs,
            unitSlug,
            doctorSlug,
            doctorName: safeDoctorName,
            durationMinutes,
            service: { id: service.id, name: service.name },
            startAtMs,
            endAtMs,
            decisionLinks,
        },
        { status: 200 },
    );
}
