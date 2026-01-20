"use client";

import { useCurrentUnit } from "@/hooks/useCurrentUnit";
import { trackAgendarClick } from "@/lib/leadTracking";

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
                onClick={() => trackAgendarClick({ placement: "header", unitSlug: unit?.slug ?? null, whatsappUrl: href })}
            >
                AGENDE
            </a>
        );
    }

    return null;
}
