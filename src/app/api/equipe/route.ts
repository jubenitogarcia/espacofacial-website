import { NextResponse } from "next/server";

const SHEET_ID = "1OBJ3RAjQqV3cQNN8xzSbRgu4leTMsSFM2X5TOnrGmSI";
const GID_EQUIPE = "1377081461";

type TeamMember = {
    name: string;
    nickname: string | null;
    units: string[];
    role: string;
    roles: string[];
    instagramHandle: string | null;
    instagramUrl: string | null;
};

function parseCsv(text: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];

        if (inQuotes) {
            if (ch === '"') {
                const next = text[i + 1];
                if (next === '"') {
                    cell += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                cell += ch;
            }
            continue;
        }

        if (ch === '"') {
            inQuotes = true;
            continue;
        }

        if (ch === ",") {
            row.push(cell);
            cell = "";
            continue;
        }

        if (ch === "\n") {
            row.push(cell);
            cell = "";
            // ignore trailing empty row
            if (row.some((c) => c.trim().length > 0)) rows.push(row);
            row = [];
            continue;
        }

        if (ch === "\r") {
            continue;
        }

        cell += ch;
    }

    row.push(cell);
    if (row.some((c) => c.trim().length > 0)) rows.push(row);

    return rows;
}

function normalizeInstagramHandle(value: string): string | null {
    const v = value.trim();
    if (!v) return null;

    // Accept @handle
    const at = v.startsWith("@") ? v.slice(1) : v;

    // Accept URL
    const m = at.match(/instagram\.com\/(?:@)?([^/?#]+)/i);
    const handle = (m ? m[1] : at).trim();

    const cleaned = handle.replace(/[^a-zA-Z0-9._]/g, "");
    return cleaned ? cleaned : null;
}

function normalizeUnits(value: string): string[] {
    const v = value.trim();
    if (!v) return [];

    return v
        .split(/,|\/|\||;|\be\/?ou\b|\be\b/gi)
        .map((s) => s.trim())
        .filter(Boolean);
}

function normalizeRoles(value: string): string[] {
    const v = value.trim();
    if (!v) return [];

    return v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}

export async function GET() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID_EQUIPE}`;

    try {
        const res = await fetch(url, {
            // Cache at the edge for a while; Google Sheets doesn’t change every second.
            next: { revalidate: 60 * 30 },
        });

        if (!res.ok) {
            return NextResponse.json({ members: [], error: `fetch_failed_${res.status}` }, { status: 200 });
        }

        const csv = await res.text();
        const rows = parseCsv(csv);

        const members: TeamMember[] = [];

        for (const row of rows) {
            const name = (row[0] ?? "").trim();
            const status = (row[1] ?? "").trim().toLowerCase();
            const unitCell = (row[2] ?? "").trim();
            const role = (row[3] ?? "").trim();
            const nickname = (row[5] ?? "").trim();
            const instagram = (row[8] ?? "").trim();

            // Skip header-ish rows
            if (!name || name.toLowerCase() === "nome") continue;
            if (status !== "ativo") continue;

            const roles = normalizeRoles(role);
            const isInjector = roles.length
                ? roles.some((r) => r.toLowerCase() === "injetor")
                : role.toLowerCase() === "injetor";
            if (!isInjector) continue;

            const units = normalizeUnits(unitCell);
            const instagramHandle = normalizeInstagramHandle(instagram);
            const instagramUrl = instagramHandle ? `https://www.instagram.com/${instagramHandle}/` : null;

            members.push({
                name,
                nickname: nickname || null,
                units,
                role: roles.length ? roles.join(", ") : role,
                roles,
                instagramHandle,
                instagramUrl,
            });
        }

        // Deterministic output
        members.sort((a, b) => (a.nickname ?? a.name).localeCompare(b.nickname ?? b.name));

        return NextResponse.json({ members }, { status: 200 });
    } catch {
        return NextResponse.json({ members: [], error: "exception" }, { status: 200 });
    }
}
