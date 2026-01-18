"use client";

import { useCurrentUnit } from "@/hooks/useCurrentUnit";
import { trackEvent } from "@/lib/analytics";

export default function DoctorAgendarPill({ doctorName }: { doctorName: string }) {
    const unit = useCurrentUnit();
    const href = unit?.contactUrl;
    if (!href) return null;

    return (
        <a
            className="pill"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
                trackEvent("cta_agendar_click", {
                    placement: "doctor",
                    doctorName,
                    unitSlug: unit?.slug ?? null,
                })
            }
        >
            AGENDAR
        </a>
    );
}
