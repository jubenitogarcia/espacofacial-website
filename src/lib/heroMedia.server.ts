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

export async function getHeroMediaItems(): Promise<{ items: HeroMediaItem[]; source: string }> {
    const fromDrive = await getFromDriveFolder();
    const fromManifest = fromDrive.length ? [] : await getFromManifestUrl();
    const remoteItems = fromDrive.length ? fromDrive : fromManifest;

    const items = dedupeHeroMediaItems([...LOCAL_HERO_ITEMS, ...remoteItems]);
    const source = remoteItems.length ? "local_and_remote" : "local_only";
    return { items, source };
}
