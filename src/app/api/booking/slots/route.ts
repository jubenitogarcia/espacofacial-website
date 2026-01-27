import { NextResponse } from "next/server";
import { getBookingDb, nowMs, addMinutes, isValidDateKey, isValidTimeKey, toSaoPauloIso } from "@/lib/bookingDb";
import { getServiceById } from "@/data/services";
import { getUnitDoctorsResult } from "@/lib/injectorsDirectory";

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
    const durationMinutesRaw = Number((url.searchParams.get("durationMinutes") ?? "").trim() || NaN);
    const date = (url.searchParams.get("date") ?? "").trim();

    if (!unitSlug || !doctorSlug || !serviceId || !date) {
        return json({ ok: false, error: "missing_params" }, { status: 400 });
    }

    if (unitSlug !== "barrashoppingsul" && unitSlug !== "novo-hamburgo") {
        return json({ ok: false, error: "invalid_unit" }, { status: 400 });
    }

    if (!isValidDateKey(date)) {
        return json({ ok: false, error: "invalid_date" }, { status: 400 });
    }

    if (serviceId !== "any") {
        const service = getServiceById(serviceId);
        if (!service) {
            return json({ ok: false, error: "invalid_service" }, { status: 400 });
        }
    }

    if (!Number.isFinite(durationMinutesRaw)) {
        return json({ ok: false, error: "missing_duration" }, { status: 400 });
    }
    const durationMinutes = Math.round(durationMinutesRaw);
    if (durationMinutes <= 0 || durationMinutes > 180 || durationMinutes % 15 !== 0) {
        return json({ ok: false, error: "invalid_duration" }, { status: 400 });
    }
    const daySlots = buildDaySlots(durationMinutes);

    const db = await getBookingDb();

    const wantsAnyDoctor = doctorSlug === "any";
    const unitDoctorsResult = wantsAnyDoctor ? await getUnitDoctorsResult(unitSlug) : null;
    if (wantsAnyDoctor && unitDoctorsResult && !unitDoctorsResult.ok) {
        return json({ ok: false, error: "doctors_unavailable" }, { status: 503 });
    }

    const unitDoctors = wantsAnyDoctor ? unitDoctorsResult!.doctors : null;
    const doctorSlugs = wantsAnyDoctor ? unitDoctors!.map((d) => d.slug) : [doctorSlug];
    if (wantsAnyDoctor && doctorSlugs.length === 0) {
        return json({ ok: false, error: "no_doctors_for_unit" }, { status: 400 });
    }

    // Fetch existing bookings for that day (unit + doctor(s))
    const dayStartIso = toSaoPauloIso(date, "00:00");
    const dayStartMs = Date.parse(dayStartIso);
    const dayEndMs = addMinutes(dayStartMs, 24 * 60);

    const inPlaceholders = doctorSlugs.map(() => "?").join(", ");
    const existing = await db
        .prepare(
            `SELECT id, doctor_slug, start_at_ms, end_at_ms, status, confirm_by_ms FROM booking_requests WHERE unit_slug = ? AND doctor_slug IN (${inPlaceholders}) AND start_at_ms < ? AND end_at_ms > ?`,
        )
        .bind(unitSlug, ...doctorSlugs, dayEndMs, dayStartMs)
        .all<{ id: string; doctor_slug: string; start_at_ms: number; end_at_ms: number; status: string; confirm_by_ms: number }>();

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
                doctorSlug: (r.doctor_slug ?? "").toString(),
                start: Number(r.start_at_ms),
                end: Number(r.end_at_ms),
                status,
                active: activeConfirmed || activePending,
                isConfirmed: activeConfirmed,
            };
        })
        .filter((r) => r.active);

    const byDoctor = new Map<string, Array<{ start: number; end: number; isConfirmed: boolean }>>();
    for (const e of normalizedExisting) {
        const key = e.doctorSlug;
        const list = byDoctor.get(key) ?? [];
        list.push({ start: e.start, end: e.end, isConfirmed: e.isConfirmed });
        if (!byDoctor.has(key)) byDoctor.set(key, list);
    }

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

        if (!wantsAnyDoctor) {
            for (const e of normalizedExisting) {
                const overlaps = e.start < endMs && e.end > startMs;
                if (!overlaps) continue;
                available = false;
                reason = e.isConfirmed ? "booked" : "in_review";
                break;
            }
        } else {
            let hasPending = false;
            let hasConfirmed = false;
            let anyFree = false;

            for (const slug of doctorSlugs) {
                const ranges = byDoctor.get(slug) ?? [];
                const overlap = ranges.some((e) => e.start < endMs && e.end > startMs);
                if (!overlap) {
                    anyFree = true;
                    break;
                }
                if (ranges.some((e) => e.start < endMs && e.end > startMs && e.isConfirmed)) hasConfirmed = true;
                if (ranges.some((e) => e.start < endMs && e.end > startMs && !e.isConfirmed)) hasPending = true;
            }

            if (!anyFree) {
                available = false;
                reason = hasPending ? "in_review" : hasConfirmed ? "booked" : "booked";
            }
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
