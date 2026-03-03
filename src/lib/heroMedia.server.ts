import "server-only";

import { driveListFolderFiles } from "@/lib/googleDrive";
import { dedupeHeroMediaItems, LOCAL_HERO_ITEMS, type HeroMediaItem } from "@/lib/heroMediaShared";

function inferTypeFromMime(mimeType: string): HeroMediaItem["type"] | null {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    return null;
}

async function getFromDriveFolder(): Promise<HeroMediaItem[]> {
    const folderId = process.env.HERO_DRIVE_FOLDER_ID ?? "1jBzRiaBRLZywHChcfT_bUSvO5JGz83BM";
    const hasServiceAccount =
        Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON) ||
        Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY);
    if (!hasServiceAccount) return [];

    try {
        const files = await driveListFolderFiles(folderId);
        const items: HeroMediaItem[] = [];

        for (const file of files) {
            const type = inferTypeFromMime(file.mimeType);
            if (!type) continue;

            items.push({
                type,
                src: `/api/drive-media/${encodeURIComponent(file.id)}`,
                alt: file.name ?? "",
            });
        }

        return items;
    } catch (err) {
        const message = err instanceof Error ? err.message : "unknown_error";
        // eslint-disable-next-line no-console
        console.warn("hero-media: drive folder load failed", message);
        return [];
    }
}

async function getFromManifestUrl(): Promise<HeroMediaItem[]> {
    const manifestUrl = process.env.HERO_MEDIA_MANIFEST_URL;
    if (!manifestUrl) return [];

    try {
        const resp = await fetch(manifestUrl, { headers: { Accept: "application/json" } });
        if (!resp.ok) return [];

        const data = (await resp.json()) as unknown;
        if (!Array.isArray(data)) return [];

        const items: HeroMediaItem[] = [];
        for (const raw of data) {
            if (!raw || typeof raw !== "object") continue;
            const obj = raw as Record<string, unknown>;
            const type = obj.type;
            const src = obj.src;
            if ((type !== "image" && type !== "video") || typeof src !== "string") continue;

            items.push({
                type,
                src,
                alt: typeof obj.alt === "string" ? obj.alt : undefined,
            });
        }

        return items;
    } catch {
        return [];
    }
}

type HeroCache = { items: HeroMediaItem[]; source: string; expiresAtMs: number };
let heroCache: HeroCache | null = null;
let refreshInFlight: Promise<void> | null = null;
const HERO_CACHE_TTL_MS = 5 * 60_000;
const HERO_REMOTE_TIMEOUT_MS = 400;

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> {
    return Promise.race([
        promise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
}

async function refreshHeroMedia(): Promise<void> {
    if (refreshInFlight) return refreshInFlight;
    refreshInFlight = (async () => {
        const fromManifest = (await withTimeout(getFromManifestUrl(), HERO_REMOTE_TIMEOUT_MS)) ?? [];
        const fromDrive = fromManifest.length ? [] : (await withTimeout(getFromDriveFolder(), HERO_REMOTE_TIMEOUT_MS)) ?? [];
        const remoteItems = fromManifest.length ? fromManifest : fromDrive;
        const items = dedupeHeroMediaItems([...LOCAL_HERO_ITEMS, ...remoteItems]);
        const source = remoteItems.length ? "local_and_remote" : "local_only";
        heroCache = { items, source, expiresAtMs: Date.now() + HERO_CACHE_TTL_MS };
    })()
        .catch(() => {
            // ignore refresh errors
        })
        .finally(() => {
            refreshInFlight = null;
        });
    return refreshInFlight;
}

export async function getHeroMediaItems(): Promise<{ items: HeroMediaItem[]; source: string }> {
    const now = Date.now();
    if (heroCache && heroCache.expiresAtMs > now) {
        return { items: heroCache.items, source: heroCache.source };
    }

    if (heroCache) {
        void refreshHeroMedia();
        return { items: heroCache.items, source: heroCache.source };
    }

    heroCache = { items: [...LOCAL_HERO_ITEMS], source: "local_only", expiresAtMs: now + HERO_CACHE_TTL_MS };
    void refreshHeroMedia();
    return { items: heroCache.items, source: heroCache.source };
}
