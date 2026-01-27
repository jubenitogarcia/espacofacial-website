type TeamMember = {
    name: string;
    nickname: string | null;
    units: string[];
    role: string;
    roles: string[];
    instagramHandle: string | null;
    instagramUrl: string | null;
};

export type InjectorsDirectoryError =
    | { code: "http_error"; status: number }
    | { code: "unexpected_content_type"; contentType: string | null }
    | { code: "html_response" }
    | { code: "exception" };

const SHEET_ID = "1OBJ3RAjQqV3cQNN8xzSbRgu4leTMsSFM2X5TOnrGmSI";
const GID_EQUIPE = "1377081461";

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
            if (row.some((c) => c.trim().length > 0)) rows.push(row);
            row = [];
            continue;
        }

        if (ch === "\r") continue;

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

export function doctorSlugFromTeamMember(member: Pick<TeamMember, "name" | "instagramHandle">): string {
    const handle = (member.instagramHandle ?? "").trim();
    if (handle) return handle;
    return member.name.toLowerCase().replace(/\s+/g, "").slice(0, 50);
}

export function unitLabelFromBookingUnitSlug(unitSlug: string): string | null {
    if (unitSlug === "barrashoppingsul") return "BarraShoppingSul";
    if (unitSlug === "novo-hamburgo" || unitSlug === "novohamburgo") return "Novo Hamburgo";
    return null;
}

export async function fetchActiveInjectorsResult(): Promise<{ ok: true; members: TeamMember[] } | { ok: false; members: TeamMember[]; error: InjectorsDirectoryError }> {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID_EQUIPE}`;
    try {
        const res = await fetch(url, {
            // Cache at the edge for a while; Google Sheets doesn’t change every second.
            next: { revalidate: 60 * 30 },
        });

        if (!res.ok) {
            return { ok: false, members: [], error: { code: "http_error", status: res.status } };
        }

        const contentType = res.headers.get("content-type");
        if (contentType && !contentType.toLowerCase().includes("text/csv")) {
            return { ok: false, members: [], error: { code: "unexpected_content_type", contentType } };
        }

        const csv = await res.text();
        if (/^\s*</.test(csv)) {
            return { ok: false, members: [], error: { code: "html_response" } };
        }

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

        return { ok: true, members };
    } catch {
        return { ok: false, members: [], error: { code: "exception" } };
    }
}

export async function fetchActiveInjectors(): Promise<TeamMember[]> {
    const result = await fetchActiveInjectorsResult();
    return result.members;
}

export async function getUnitDoctorsResult(unitSlug: string): Promise<
    | { ok: true; doctors: Array<{ slug: string; name: string }> }
    | { ok: false; doctors: Array<{ slug: string; name: string }>; error: InjectorsDirectoryError }
> {
    const label = unitLabelFromBookingUnitSlug(unitSlug);
    if (!label) return { ok: true, doctors: [] };

    const membersResult = await fetchActiveInjectorsResult();
    if (!membersResult.ok) return { ok: false, doctors: [], error: membersResult.error };

    const doctors = membersResult.members
        .filter((m) => m.units.map((u) => u.toLowerCase()).includes(label.toLowerCase()))
        .map((m) => ({ slug: doctorSlugFromTeamMember(m), name: m.name }));

    return { ok: true, doctors };
}

export async function getUnitDoctors(unitSlug: string): Promise<Array<{ slug: string; name: string }>> {
    const result = await getUnitDoctorsResult(unitSlug);
    return result.doctors;
}
