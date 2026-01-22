"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
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
    const [prevIndex, setPrevIndex] = useState<number | null>(null);

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

    const goTo = useCallback(
        (nextIndex: number) => {
            if (items.length <= 1) return;
            if (nextIndex === index) return;
            if (nextIndex < 0 || nextIndex >= items.length) return;
            setPrevIndex(index);
            setIndex(nextIndex);
        },
        [index, items.length],
    );

    const goNext = useCallback(() => {
        goTo((index + 1) % items.length);
    }, [goTo, index, items.length]);

    useEffect(() => {
        if (prevIndex === null) return;
        const t = window.setTimeout(() => setPrevIndex(null), 650);
        return () => window.clearTimeout(t);
    }, [prevIndex]);

    useEffect(() => {
        if (items.length <= 1) return;
        if (item.type !== "image") return;

        const t = window.setTimeout(() => {
            goNext();
        }, 6000);

        return () => window.clearTimeout(t);
    }, [goNext, items.length, item.type]);

    const style = useMemo<HeroStyle>(() => {
        return { "--hero-ar": aspectRatio };
    }, [aspectRatio]);

    const shouldAnimateIn = prevIndex !== null;

    const renderLayer = (layerItem: HeroMediaItem, opts: { layerKey: string; kind: "active" | "prev" }) => {
        const layerClass =
            opts.kind === "active"
                ? `heroMediaLayer heroMediaLayer--active${shouldAnimateIn ? " heroMediaLayer--fadeIn" : ""}`
                : "heroMediaLayer heroMediaLayer--prev";

        return (
            <div key={opts.layerKey} className={layerClass}>
                {layerItem.type === "video" ? (
                    <video
                        className="heroMediaEl"
                        src={layerItem.src}
                        autoPlay={opts.kind === "active"}
                        muted
                        loop={opts.kind === "active" ? shouldLoopVideo : false}
                        playsInline
                        preload="metadata"
                        onError={() => {
                            if (items.length <= 1) return;
                            if (opts.kind !== "active") return;
                            goNext();
                        }}
                        onLoadedMetadata={(e) => {
                            if (opts.kind !== "active") return;
                            const v = e.currentTarget;
                            if (v.videoWidth > 0 && v.videoHeight > 0) {
                                setAspectRatio(`${v.videoWidth} / ${v.videoHeight}`);
                            }
                        }}
                        onEnded={() => {
                            if (items.length <= 1) return;
                            if (opts.kind !== "active") return;
                            goNext();
                        }}
                    />
                ) : (
                    <Image
                        className="heroMediaEl"
                        src={layerItem.src}
                        alt={layerItem.alt ?? "Espaço Facial"}
                        fill
                        priority={opts.kind === "active"}
                        sizes="100vw"
                        unoptimized
                        onError={() => {
                            if (items.length <= 1) return;
                            if (opts.kind !== "active") return;
                            goNext();
                        }}
                        onLoadingComplete={(img) => {
                            if (opts.kind !== "active") return;
                            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                                setAspectRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
                            }
                        }}
                        style={{ objectFit: "cover" }}
                    />
                )}
            </div>
        );
    };

    return (
        <div className="heroMedia" style={style}>
            {renderLayer(item, { layerKey: `active:${item.src}`, kind: "active" })}
            {prevIndex !== null && items[prevIndex] ? renderLayer(items[prevIndex]!, { layerKey: `prev:${items[prevIndex]!.src}:${prevIndex}`, kind: "prev" }) : null}

            {items.length > 1 ? (
                <div className="heroMediaNav" aria-label="Selecionar mídia do banner" role="tablist">
                    {items.map((_, i) => {
                        const active = i === index;
                        return (
                            <button
                                key={i}
                                type="button"
                                className={`heroDot${active ? " heroDot--active" : ""}`}
                                aria-label={`Ir para ${i + 1} de ${items.length}`}
                                aria-pressed={active}
                                onClick={() => goTo(i)}
                            />
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}
