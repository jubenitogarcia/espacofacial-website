import { NextResponse } from "next/server";
import { getAgendaDb, toUnitSlug } from "@/lib/agendaDb";

export const dynamic = "force-dynamic";

type AppointmentRow = {
    unit_slug: string;
    date_key: string;
    time_key: string;
    client: string;
    tipo: string;
    profissional: string;
    telefone: string | null;
    cpf: string | null;
    service: string | null;
    notes: string | null;
    status: string | null;
};

function json(data: unknown, init?: ResponseInit) {
    return NextResponse.json(data, init);
}

function readToken(request: Request): string {
    const auth = (request.headers.get("authorization") ?? "").trim();
    if (auth.toLowerCase().startsWith("bearer ")) {
        return auth.slice(7).trim();
    }
    return (request.headers.get("x-agenda-sync-token") ?? "").trim();
}

function assertToken(request: Request): boolean {
    const secret = (process.env.AGENDA_SYNC_TOKEN ?? "").trim();
    if (!secret) return true;
    return readToken(request) === secret;
}

function isValidDateKey(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test((value ?? "").trim());
}

export async function GET(request: Request) {
    if (!assertToken(request)) {
        return json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const unitSlugRaw = (url.searchParams.get("unit_slug") ?? "").trim();
    const dateFrom = (url.searchParams.get("date_from") ?? "").trim();
    const dateTo = (url.searchParams.get("date_to") ?? "").trim();

    if (!unitSlugRaw || !dateFrom || !dateTo) {
        return json({ ok: false, error: "missing_params" }, { status: 400 });
    }

    const unitSlug = toUnitSlug(unitSlugRaw);
    if (!unitSlug || (unitSlug !== "barrashoppingsul" && unitSlug !== "novo-hamburgo")) {
        return json({ ok: false, error: "invalid_unit" }, { status: 400 });
    }

    if (!isValidDateKey(dateFrom) || !isValidDateKey(dateTo)) {
        return json({ ok: false, error: "invalid_date" }, { status: 400 });
    }

    if (dateFrom > dateTo) {
        return json({ ok: false, error: "invalid_range" }, { status: 400 });
    }

    const db = await getAgendaDb();
    const result = await db
        .prepare(
            `SELECT unit_slug, date_key, time_key, client, tipo, profissional, telefone, cpf, service, notes, status
             FROM agenda_appointments
             WHERE unit_slug = ? AND date_key BETWEEN ? AND ? AND removed_at_ms IS NULL
             ORDER BY date_key ASC, time_key ASC;`,
        )
        .bind(unitSlug, dateFrom, dateTo)
        .all<AppointmentRow>();

    return json({ ok: true, appointments: result.results ?? [] }, { status: 200 });
}
