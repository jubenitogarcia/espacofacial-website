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

    // Fallback: assume caller passed a valid relative resource name
    return `accounts/${accountId}/${raw}`;
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
    const pageSize = clamp(parsePositiveInt(searchParams.get("pageSize"), 12), 1, 50);

    if (!locationParam) {
        return NextResponse.json({ available: false, error: "missing_location" }, { status: 400 });
    }

    let location: string;
    try {
        location = resolveGbpLocation(locationParam);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "exception";
        const status = msg === "missing_gbp_account_id" ? 503 : 400;
        return NextResponse.json({ available: false, error: msg }, { status, headers: { "x-gbp": "bad_location" } });
    }

    const cache = getCloudflareCache();
    const cacheBucket = Math.floor(Date.now() / (1000 * 60 * 10)); // 10 minutes
    const cacheKey = new Request(
        `https://espacofacial.com/__cache/gbp/photos?v=1&b=${cacheBucket}&location=${encodeURIComponent(location)}&pageToken=${encodeURIComponent(
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

    try {
        const accessToken = await getAccessToken();

        const url = new URL(`https://mybusiness.googleapis.com/v4/${location}/media`);
        url.searchParams.set("pageSize", String(pageSize));
        if (pageToken) url.searchParams.set("pageToken", pageToken);

        const res = await fetch(url.toString(), {
            headers: { authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
            const upstreamBody = await res.text().catch(() => "");
            const payload = {
                available: false,
                error: "gbp_media_fetch_failed",
                status: res.status,
                upstream: upstreamBody ? upstreamBody.slice(0, 2000) : null,
            };
            return NextResponse.json(payload, {
                status: 502,
                headers: {
                    "cache-control": "no-store",
                    "x-gbp": "media_failed",
                    "x-gbp-upstream-status": String(res.status),
                },
            });
        }

        const json = (await res.json()) as {
            mediaItems?: Array<{ name?: string; thumbnailUrl?: string; googleUrl?: string }>;
            nextPageToken?: string;
        };

        const items = (json.mediaItems ?? [])
            .filter((m) => typeof m?.thumbnailUrl === "string" && m.thumbnailUrl)
            .map((m) => ({
                name: m.name ?? "",
                thumbnailUrl: m.thumbnailUrl as string,
                googleUrl: typeof m.googleUrl === "string" ? m.googleUrl : null,
            }));

        const payload = {
            available: true,
            items,
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
