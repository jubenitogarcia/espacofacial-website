import { driveListFolderFiles } from "@/lib/googleDrive";

type HeroMediaItem = {
    type: "image" | "video";
    src: string;
    alt?: string;
};

function inferTypeFromMime(mimeType: string): HeroMediaItem["type"] | null {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    return null;
}

async function getFromDriveFolder(): Promise<HeroMediaItem[] | null> {
    // Default to the provided folder id, but allow overriding via env.
    const folderId = process.env.HERO_DRIVE_FOLDER_ID ?? "1jBzRiaBRLZywHChcfT_bUSvO5JGz83BM";

    try {
        const files = await driveListFolderFiles(folderId);
        const items: HeroMediaItem[] = [];

        for (const file of files) {
            const type = inferTypeFromMime(file.mimeType);
            if (!type) continue;

            // Proxy through our origin so private Drive files work in the browser.
            items.push({
                type,
                src: `/api/drive-media/${encodeURIComponent(file.id)}`,
                alt: file.name ?? "",
            });
        }

        return items.length ? items : null;
    } catch (err) {
        // Keep failure silent for users; debug can be read via headers / ?debug=1.
        const message = err instanceof Error ? err.message : "unknown_error";
        // eslint-disable-next-line no-console
        console.warn("hero-media: drive folder load failed", message);
        return null;
    }
}

async function getFromManifestUrl(): Promise<HeroMediaItem[] | null> {
    const manifestUrl = process.env.HERO_MEDIA_MANIFEST_URL;
    if (!manifestUrl) return null;

    const resp = await fetch(manifestUrl, { headers: { Accept: "application/json" } });
    if (!resp.ok) return null;

    const data = (await resp.json()) as unknown;
    if (!Array.isArray(data)) return null;

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

    return items.length ? items : null;
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const debug = url.searchParams.get("debug") === "1";

    const items = (await getFromDriveFolder()) ?? (await getFromManifestUrl()) ?? [];
    const fallback: HeroMediaItem[] = [
        {
            type: "image",
            src: "/images/hero.svg",
            alt: "Espaço Facial",
        },
    ];

    const source = items.length ? "drive_or_manifest" : "fallback";
    const payload = { items: items.length ? items : fallback } as {
        items: HeroMediaItem[];
        debug?: { source: string; count: number };
    };

    if (debug) {
        payload.debug = { source, count: payload.items.length };
    }

    return Response.json(
        payload,
        {
            headers: {
                "cache-control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
                "x-hero-source": source,
                "x-hero-items": String(items.length ? items.length : fallback.length),
            },
        },
    );
}
