"use client";

import { useCurrentUnit } from "@/hooks/useCurrentUnit";

export default function DoctorAgendarPill({ doctorName }: { doctorName: string }) {
    const unit = useCurrentUnit();
    const href = unit?.contactUrl;
    if (!href) return null;

    return (
        <a className="pill" href={href} target="_blank" rel="noopener noreferrer">
            AGENDAR
        </a>
    );
}
