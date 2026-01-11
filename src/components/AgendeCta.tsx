"use client";

import Link from "next/link";
import { useCurrentUnit } from "@/hooks/useCurrentUnit";

export default function AgendeCta() {
    const unit = useCurrentUnit();

    const href = unit?.contactUrl ?? null;

    if (href) {
        return (
            <a className="cta" href={href} target="_blank" rel="noreferrer">
                AGENDE
            </a>
        );
    }

    return (
        <Link className="cta" href="/unidades">
            ESCOLHER UNIDADE
        </Link>
    );
}
