"use client";

import { useEffect, useRef, useState } from "react";
import { units } from "@/data/units";
import { setStoredUnitSlug } from "@/lib/unitSelection";
import { useCurrentUnit } from "@/hooks/useCurrentUnit";
import { trackEvent } from "@/lib/analytics";

const ALLOWED_UNIT_SLUGS = ["barrashoppingsul", "novo-hamburgo"] as const;

function getAllowedUnits() {
    return units.filter((u) => (ALLOWED_UNIT_SLUGS as readonly string[]).includes(u.slug));
}

export default function UnitChooser() {
    const unit = useCurrentUnit();
    const allowed = getAllowedUnits();

    const [open, setOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            const el = wrapRef.current;
            if (!el) return;
            if (e.target instanceof Node && el.contains(e.target)) return;
            setOpen(false);
        }

        document.addEventListener("click", onDocClick);
        return () => document.removeEventListener("click", onDocClick);
    }, []);

    const label = unit?.name ? unit.name : "Selecione Unidade";

    return (
        <div className="unitChooser" ref={wrapRef}>
            <button
                className="unitChooserBtn"
                type="button"
                onClick={() => {
                    setOpen((v) => !v);
                    trackEvent("unit_chooser_open", { placement: "header" });
                }}
                aria-haspopup="menu"
                aria-expanded={open}
            >
                {label}
            </button>

            {open ? (
                <div className="unitChooserMenu" role="menu" aria-label="Escolher unidade">
                    {allowed.map((u) => (
                        <button
                            key={u.slug}
                            className="unitChooserItem"
                            role="menuitem"
                            type="button"
                            onClick={() => {
                                setStoredUnitSlug(u.slug);
                                trackEvent("unit_select", { unitSlug: u.slug, placement: "header_unit_chooser" });
                                setOpen(false);
                            }}
                        >
                            <div className="unitChooserItemTitle">{u.name}</div>
                            {u.addressLine ? <div className="unitChooserItemSub">{u.addressLine}</div> : null}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
