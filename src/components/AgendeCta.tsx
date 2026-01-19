"use client";

import { useCurrentUnit } from "@/hooks/useCurrentUnit";
import { trackEvent } from "@/lib/analytics";

export default function AgendeCta() {
    const unit = useCurrentUnit();

    const href = unit?.contactUrl ?? null;

    if (href) {
        return (
            <a
                className="cta"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("cta_agendar_click", { placement: "header", unitSlug: unit?.slug ?? null })}
            >
                AGENDE
            </a>
        );
    }

    return null;
}
