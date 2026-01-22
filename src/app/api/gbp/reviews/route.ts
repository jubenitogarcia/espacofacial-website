import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type CfCacheStorage = {
    default?: Cache;
};

function getCloudflareCache(): Cache | null {
    const cachesAny = (globalThis as unknown as { caches?: CfCacheStorage }).caches;
    return cachesAny?.default ?? null;
}

type TokenCache = {
    accessToken: string;
    expiresAtMs: number;
};

let tokenCache: TokenCache | null = null;

async function getAccessToken(): Promise<string> {
    const clientId = (process.env.GOOGLE_GBP_CLIENT_ID ?? "").trim();
    const clientSecret = (process.env.GOOGLE_GBP_CLIENT_SECRET ?? "").trim();
    const refreshToken = (process.env.GOOGLE_GBP_REFRESH_TOKEN ?? "").trim();

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error("missing_gbp_oauth_config");
    }

    const now = Date.now();
    if (tokenCache && tokenCache.expiresAtMs - 30_000 > now) {
        return tokenCache.accessToken;
    }

    const body = new URLSearchParams();
    body.set("client_id", clientId);
    body.set("client_secret", clientSecret);
    body.set("refresh_token", refreshToken);
    body.set("grant_type", "refresh_token");

    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: body.toString(),
    });

    if (!res.ok) {
        throw new Error("oauth_refresh_failed");
    }

    const json = (await res.json()) as { access_token?: string; expires_in?: number };
    const accessToken = (json.access_token ?? "").trim();
    const expiresIn = typeof json.expires_in === "number" ? json.expires_in : 300;

    if (!accessToken) {
        throw new Error("missing_access_token");
    }

    tokenCache = {
        accessToken,
        expiresAtMs: now + expiresIn * 1000,
    };

    return accessToken;
}

function resolveGbpLocation(input: string): string {
    const raw = (input ?? "").trim();
    if (!raw) throw new Error("missing_location");

    if (raw.startsWith("accounts/")) return raw;

    const accountId = (process.env.GOOGLE_GBP_ACCOUNT_ID ?? "").trim();
    if (!accountId) throw new Error("missing_gbp_account_id");

    if (raw.startsWith("locations/")) {
        return `accounts/${accountId}/${raw}`;
    }

    if (/^\d+$/.test(raw)) {
        return `accounts/${accountId}/locations/${raw}`;
    }

    return `accounts/${accountId}/${raw}`;
}

function parseLocationId(input: string): string | null {
    const raw = (input ?? "").trim();
    if (!raw) return null;
    if (raw.startsWith("accounts/")) return null;
    if (raw.startsWith("locations/")) {
        const id = raw.slice("locations/".length).trim();
        return id || null;
    }
    if (/^\d+$/.test(raw)) return raw;
    return null;
}

async function listAccountIds(accessToken: string): Promise<string[]> {
    const res = await fetch("https://mybusiness.googleapis.com/v4/accounts", {
        headers: { authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { accounts?: Array<{ name?: string }> };
    const ids = (json.accounts ?? [])
        .map((a) => (a?.name ?? "").trim())
        .filter((name) => name.startsWith("accounts/"))
        .map((name) => name.slice("accounts/".length))
        .map((id) => id.trim())
        .filter(Boolean);
    return Array.from(new Set(ids)).slice(0, 20);
}

async function discoverLocationResourceName(accessToken: string, locationId: string): Promise<string> {
    const accountIds = await listAccountIds(accessToken);
    for (const accountId of accountIds) {
        const candidate = `accounts/${accountId}/locations/${locationId}`;
        const probe = await fetch(`https://mybusiness.googleapis.com/v4/${candidate}`, {
            headers: { authorization: `Bearer ${accessToken}` },
        });
        if (probe.ok) return candidate;
    }
    throw new Error("location_not_found");
}

function parseStarRating(value: unknown): number | null {
    if (typeof value !== "string") return null;
    switch (value) {
        case "STAR_RATING_ONE":
            return 1;
        case "STAR_RATING_TWO":
            return 2;
        case "STAR_RATING_THREE":
            return 3;
        case "STAR_RATING_FOUR":
            return 4;
        case "STAR_RATING_FIVE":
            return 5;
        default:
            return null;
    }
}

function toEpochSeconds(iso: string | null | undefined): number | null {
    if (!iso) return null;
    const ms = Date.parse(iso);
    if (!Number.isFinite(ms)) return null;
    return Math.floor(ms / 1000);
}

function parsePositiveInt(value: string | null, fallback: number): number {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(1, Math.floor(n));
}

function clamp(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, n));
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const locationParam = (searchParams.get("location") ?? "").trim();
    const pageToken = (searchParams.get("pageToken") ?? "").trim();
    const pageSize = clamp(parsePositiveInt(searchParams.get("pageSize"), 10), 1, 50);

    if (!locationParam) {
        return NextResponse.json({ available: false, error: "missing_location" }, { status: 400 });
    }

    const locationId = parseLocationId(locationParam);

    try {
        const accessToken = await getAccessToken();

        let location: string;
        try {
            location = resolveGbpLocation(locationParam);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "exception";
            if (msg === "missing_gbp_account_id" && locationId) {
                location = await discoverLocationResourceName(accessToken, locationId);
            } else {
                const status = msg === "missing_gbp_account_id" ? 503 : 400;
                return NextResponse.json({ available: false, error: msg }, { status, headers: { "x-gbp": "bad_location" } });
            }
        }

        const cache = getCloudflareCache();
        const cacheBucket = Math.floor(Date.now() / (1000 * 60 * 10)); // 10 minutes
        const cacheKey = new Request(
            `https://espacofacial.com/__cache/gbp/reviews?v=1&b=${cacheBucket}&location=${encodeURIComponent(location)}&pageToken=${encodeURIComponent(
                pageToken,
            )}&pageSize=${pageSize}`,
        );

        if (cache) {
            const hit = await cache.match(cacheKey);
            if (hit) {
                const payload = await hit.json().catch(() => null);
                if (payload) {
                    return NextResponse.json(payload, {
                        status: 200,
                        headers: { "cache-control": "public, max-age=60, s-maxage=600", "x-gbp": "cache" },
                    });
                }
            }
        }

        const url = new URL(`https://mybusiness.googleapis.com/v4/${location}/reviews`);
        url.searchParams.set("pageSize", String(pageSize));
        if (pageToken) url.searchParams.set("pageToken", pageToken);

        let res = await fetch(url.toString(), {
            headers: { authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok && res.status === 404 && locationId && !locationParam.startsWith("accounts/")) {
            try {
                const discovered = await discoverLocationResourceName(accessToken, locationId);
                if (discovered && discovered !== location) {
                    const retryUrl = new URL(`https://mybusiness.googleapis.com/v4/${discovered}/reviews`);
                    retryUrl.searchParams.set("pageSize", String(pageSize));
                    if (pageToken) retryUrl.searchParams.set("pageToken", pageToken);
                    location = discovered;
                    res = await fetch(retryUrl.toString(), { headers: { authorization: `Bearer ${accessToken}` } });
                }
            } catch {
                // ignore discovery errors; fall through to upstream error handling
            }
        }

        if (!res.ok) {
            const upstreamBody = await res.text().catch(() => "");
            const payload = {
                available: false,
                error: "gbp_reviews_fetch_failed",
                status: res.status,
                upstream: upstreamBody ? upstreamBody.slice(0, 2000) : null,
            };
            return NextResponse.json(payload, {
                status: 502,
                headers: {
                    "cache-control": "no-store",
                    "x-gbp": "reviews_failed",
                    "x-gbp-upstream-status": String(res.status),
                },
            });
        }

        const json = (await res.json()) as {
            reviews?: Array<{
                reviewId?: string;
                reviewer?: { displayName?: string };
                starRating?: string;
                comment?: string;
                createTime?: string;
                updateTime?: string;
            }>;
            nextPageToken?: string;
        };

        const reviews = (json.reviews ?? []).map((r) => {
            const time = toEpochSeconds(r.updateTime ?? r.createTime ?? null);
            return {
                reviewId: r.reviewId ?? "",
                authorName: r.reviewer?.displayName ?? "",
                rating: parseStarRating(r.starRating),
                relativeTimeDescription: "",
                time,
                text: r.comment ?? "",
            };
        });

        const payload = {
            available: true,
            reviews,
            nextPageToken: (json.nextPageToken ?? "").trim() || null,
        };

        if (cache) void cache.put(cacheKey, new Response(JSON.stringify(payload), { headers: { "content-type": "application/json" } }));

        return NextResponse.json(payload, {
            status: 200,
            headers: { "cache-control": "public, max-age=60, s-maxage=600", "x-gbp": "ok" },
        });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "exception";
        const status = msg === "missing_gbp_oauth_config" ? 503 : 500;
        return NextResponse.json({ available: false, error: msg }, { status, headers: { "x-gbp": "exception" } });
    }
}
