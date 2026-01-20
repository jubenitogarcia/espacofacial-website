"use client";

import { useMemo, useState } from "react";

type Props = {
    className?: string;
    title?: string;
    tone?: "dark" | "light";
};

export default function BrandLogo({ className, title = "Espaço Facial", tone = "dark" }: Props) {
    // Prefer PNG for rendering consistency; fall back to SVG if PNGs aren't present.
    const candidates = useMemo(() => {
        if (tone === "light") {
            return ["/logo-white.png", "/logo.png", "/logo-white.svg", "/logo.svg"] as const;
        }

        return ["/logo.png", "/logo.svg"] as const;
    }, [tone]);

    const [candidateIndex, setCandidateIndex] = useState(0);

    // Cache-busting for edge/CDN deployments (e.g. Cloudflare) that may keep an old asset cached.
    const src = `${candidates[candidateIndex]}?v=20260120a`;

    const shouldInvert = tone === "light" && !candidates[candidateIndex].includes("white");

    return (
        <img
            src={src}
            alt={title}
            className={className}
            draggable={false}
            decoding="async"
            style={shouldInvert ? { filter: "invert(1)" } : undefined}
            onError={() => {
                setCandidateIndex((current) => (current < candidates.length - 1 ? current + 1 : current));
            }}
        />
    );
}
