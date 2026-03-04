import http from "node:http";
import nodemailer from "nodemailer";

const port = Number(process.env.EMAIL_RELAY_PORT || 8789);
const secret = (process.env.BOOKING_EMAIL_WEBHOOK_SECRET ?? "").trim();
const host = (process.env.TITAN_SMTP_HOST ?? "").trim();
const portEnv = Number(process.env.TITAN_SMTP_PORT || 587);
const secureEnv = (process.env.TITAN_SMTP_SECURE ?? "").trim().toLowerCase();
const secure = secureEnv === "true" || portEnv === 465;

const barraUser = (process.env.TITAN_SMTP_USER_BARRA ?? "").trim();
const barraPass = (process.env.TITAN_SMTP_PASS_BARRA ?? "").trim();
const nhUser = (process.env.TITAN_SMTP_USER_NH ?? "").trim();
const nhPass = (process.env.TITAN_SMTP_PASS_NH ?? "").trim();

function pickCreds(from, unitSlug) {
    const fromLower = (from ?? "").toLowerCase();
    const unit = (unitSlug ?? "").toLowerCase();
    if (fromLower.includes("barrashoppingsul@") || unit === "barrashoppingsul") {
        return { user: barraUser, pass: barraPass };
    }
    if (fromLower.includes("novohamburgo@") || unit === "novo-hamburgo") {
        return { user: nhUser, pass: nhPass };
    }
    return { user: "", pass: "" };
}

function json(res, code, payload) {
    res.writeHead(code, { "content-type": "application/json" });
    res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
    if (req.method !== "POST") return json(res, 405, { ok: false, error: "method_not_allowed" });
    if (secret) {
        const header = (req.headers["x-booking-webhook-secret"] ?? "").toString().trim();
        if (header !== secret) return json(res, 401, { ok: false, error: "unauthorized" });
    }

    if (!host) return json(res, 500, { ok: false, error: "missing_smtp_host" });

    let raw = "";
    req.on("data", (chunk) => {
        raw += chunk;
        if (raw.length > 200_000) req.destroy();
    });
    req.on("end", async () => {
        let body;
        try {
            body = JSON.parse(raw || "{}");
        } catch {
            return json(res, 400, { ok: false, error: "invalid_json" });
        }

        const to = (body.to ?? "").toString().trim();
        const from = (body.from ?? "").toString().trim();
        const subject = (body.subject ?? "").toString().trim();
        const text = (body.text ?? "").toString();
        const html = (body.html ?? "").toString();
        const unitSlug = (body.unitSlug ?? "").toString();

        if (!to || !from || !subject) return json(res, 400, { ok: false, error: "missing_fields" });

        const creds = pickCreds(from, unitSlug);
        if (!creds.user || !creds.pass) return json(res, 500, { ok: false, error: "missing_smtp_creds" });

        try {
            const transporter = nodemailer.createTransport({
                host,
                port: portEnv,
                secure,
                auth: {
                    user: creds.user,
                    pass: creds.pass,
                },
            });

            await transporter.sendMail({
                from,
                to,
                subject,
                text,
                html,
            });

            return json(res, 200, { ok: true });
        } catch (error) {
            return json(res, 500, { ok: false, error: error instanceof Error ? error.message : "send_failed" });
        }
    });
});

server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`email-relay listening on :${port}`);
});
