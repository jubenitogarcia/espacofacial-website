import { NextResponse } from "next/server";
import { getBookingDb, nowMs, addMinutes, isValidDateKey, isValidTimeKey, toSaoPauloIso } from "@/lib/bookingDb";
import { getServiceById } from "@/data/services";

export const dynamic = "force-dynamic";

function json(data: unknown, init?: ResponseInit) {
    return NextResponse.json(data, init);
}

function parseUnitSlug(value: string | null): string {
    return (value ?? "").trim();
}

function parseDoctorSlug(value: string | null): string {
    return (value ?? "").trim();
}

function formatTimeHHMM(hours: number, minutes: number): string {
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    return `${hh}:${mm}`;
}

function buildDaySlots(durationMinutes: number) {
    // MVP: fixed schedule window, 15-min grid.
    // Can be expanded per unit/doctor later.
    const slots: Array<{ time: string; startOffsetMin: number }> = [];

    const startHour = 9;
    const endHour = 18;
    const step = 15;

    for (let h = startHour; h < endHour; h++) {
        for (let m = 0; m < 60; m += step) {
            const startMin = h * 60 + m;
            const endMin = startMin + durationMinutes;
            if (endMin > endHour * 60) continue;

            // Simple lunch break exclusion (12:00-13:00)
            if (startMin >= 12 * 60 && startMin < 13 * 60) continue;

            slots.push({ time: formatTimeHHMM(h, m), startOffsetMin: startMin });
        }
    }

    return slots;
}

async function expireIfNeeded(db: Awaited<ReturnType<typeof getBookingDb>>, id: string) {
    // Best-effort: mark pending approvals as expired after confirm_by.
    const row = await db
        .prepare("SELECT id, status, confirm_by_ms FROM booking_requests WHERE id = ?")
        .bind(id)
        .first<{ id: string; status: string; confirm_by_ms: number }>();

    if (!row) return;
    const status = (row.status ?? "").toString();
    if (status !== "pending" && status !== "needs_approval") return;

    const now = nowMs();
    if (now <= Number(row.confirm_by_ms)) return;

    await db
        .prepare(
            "UPDATE booking_requests SET status = 'expired', decided_at_ms = ?, decision_note = COALESCE(decision_note, 'auto_expired') WHERE id = ? AND (status = 'pending' OR status = 'needs_approval')",
        )
        .bind(now, id)
        .run();
}

export async function GET(req: Request) {
    const url = new URL(req.url);

    const unitSlug = parseUnitSlug(url.searchParams.get("unit"));
    const doctorSlug = parseDoctorSlug(url.searchParams.get("doctor"));
    const serviceId = (url.searchParams.get("service") ?? "").trim();
    const date = (url.searchParams.get("date") ?? "").trim();

    if (!unitSlug || !doctorSlug || !serviceId || !date) {
        return json({ ok: false, error: "missing_params" }, { status: 400 });
    }

    if (!isValidDateKey(date)) {
        return json({ ok: false, error: "invalid_date" }, { status: 400 });
    }

    const service = getServiceById(serviceId);
    if (!service) {
        return json({ ok: false, error: "invalid_service" }, { status: 400 });
    }

    const durationMinutes = service.durationMinutes;
    const daySlots = buildDaySlots(durationMinutes);

    const db = await getBookingDb();

    // Fetch existing bookings for that day (unit + doctor only)
    const dayStartIso = toSaoPauloIso(date, "00:00");
    const dayStartMs = Date.parse(dayStartIso);
    const dayEndMs = addMinutes(dayStartMs, 24 * 60);

    const existing = await db
        .prepare(
            "SELECT id, start_at_ms, end_at_ms, status, confirm_by_ms FROM booking_requests WHERE unit_slug = ? AND doctor_slug = ? AND start_at_ms < ? AND end_at_ms > ?",
        )
        .bind(unitSlug, doctorSlug, dayEndMs, dayStartMs)
        .all<{ id: string; start_at_ms: number; end_at_ms: number; status: string; confirm_by_ms: number }>();

    // Expire stale rows we just loaded.
    for (const row of existing.results) {
        await expireIfNeeded(db, row.id);
    }

    const now = nowMs();

    const normalizedExisting = existing.results
        .map((r) => {
            const status = (r.status ?? "").toString();
            const confirmBy = Number(r.confirm_by_ms ?? 0);
            const activePending = (status === "pending" || status === "needs_approval") && now <= confirmBy;
            const activeConfirmed = status === "confirmed";
            return {
                id: r.id,
                start: Number(r.start_at_ms),
                end: Number(r.end_at_ms),
                status,
                active: activeConfirmed || activePending,
                isConfirmed: activeConfirmed,
            };
        })
        .filter((r) => r.active);

    const out = daySlots.map((s) => {
        const time = s.time;
        if (!isValidTimeKey(time)) {
            return { time, available: false, reason: "invalid_time" };
        }

        const startIso = toSaoPauloIso(date, time);
        const startMs = Date.parse(startIso);
        const endMs = addMinutes(startMs, durationMinutes);

        let available = true;
        let reason: string | null = null;

        for (const e of normalizedExisting) {
            const overlaps = e.start < endMs && e.end > startMs;
            if (!overlaps) continue;
            available = false;
            reason = e.isConfirmed ? "booked" : "in_review";
            break;
        }

        // Prevent booking in the past.
        if (available && startMs < now) {
            available = false;
            reason = "past";
        }

        return {
            time,
            startAtMs: startMs,
            endAtMs: endMs,
            available,
            reason,
        };
    });

    return json({ ok: true, unitSlug, doctorSlug, serviceId, durationMinutes, date, slots: out }, { status: 200 });
}
