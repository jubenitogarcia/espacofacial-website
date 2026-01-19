"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";

type HeroMediaItem = {
    type: "image" | "video";
    src: string;
    alt?: string;
};

export default function HeroMedia() {
    const [items, setItems] = useState<HeroMediaItem[]>([
        {
            type: "image",
            src: "/images/hero.svg",
            alt: "Espaço Facial",
        },
    ]);

    const [index, setIndex] = useState(0);

    const [aspectRatio, setAspectRatio] = useState<string>("16 / 9");

    type HeroStyle = CSSProperties & Record<"--hero-ar", string>;

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const resp = await fetch("/api/hero-media", { cache: "no-store" });
                if (!resp.ok) return;
                if (cancelled) return;

                const data = (await resp.json()) as { items?: HeroMediaItem[] };
                if (!Array.isArray(data.items) || data.items.length === 0) return;

                // Shuffle so the loop feels fresh on each visit.
                const shuffled = [...data.items].sort(() => Math.random() - 0.5);
                setItems(shuffled);
                setIndex(0);
            } catch {
                // ignore; keep fallback
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const item = items[index] ?? items[0]!;
    const shouldLoopVideo = item.type === "video" && items.length === 1;

    useEffect(() => {
        if (items.length <= 1) return;
        if (item.type !== "image") return;

        const t = window.setTimeout(() => {
            setIndex((i) => (i + 1) % items.length);
        }, 6000);

        return () => window.clearTimeout(t);
    }, [items.length, item.type]);

    const style = useMemo<HeroStyle>(() => {
        return { "--hero-ar": aspectRatio };
    }, [aspectRatio]);

    return (
        <div className="heroMedia" style={style}>
            {item.type === "video" ? (
                <video
                    key={item.src}
                    className="heroMediaEl"
                    src={item.src}
                    autoPlay
                    muted
                    loop={shouldLoopVideo}
                    playsInline
                    preload="metadata"
                    onError={() => {
                        if (items.length <= 1) return;
                        setIndex((i) => (i + 1) % items.length);
                    }}
                    onLoadedMetadata={(e) => {
                        const v = e.currentTarget;
                        if (v.videoWidth > 0 && v.videoHeight > 0) {
                            setAspectRatio(`${v.videoWidth} / ${v.videoHeight}`);
                        }
                    }}
                    onEnded={() => {
                        if (items.length <= 1) return;
                        setIndex((i) => (i + 1) % items.length);
                    }}
                />
            ) : (
                <Image
                    key={item.src}
                    className="heroMediaEl"
                    src={item.src}
                    alt={item.alt ?? "Espaço Facial"}
                    fill
                    priority
                    sizes="100vw"
                    unoptimized
                    onError={() => {
                        if (items.length <= 1) return;
                        setIndex((i) => (i + 1) % items.length);
                    }}
                    onLoadingComplete={(img) => {
                        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                            setAspectRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
                        }
                    }}
                    style={{ objectFit: "cover" }}
                />
            )}
        </div>
    );
}
