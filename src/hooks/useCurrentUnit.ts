"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { units, type Unit } from "@/data/units";
import { getStoredUnitSlug, setStoredUnitSlug } from "@/lib/unitSelection";

function findUnitBySlug(slug: string | null | undefined): Unit | null {
    if (!slug) return null;
    return units.find((u) => u.slug === slug) ?? null;
}

export function useCurrentUnit(): Unit | null {
    const pathname = usePathname();

    const slugFromPath = useMemo(() => {
        if (!pathname) return null;
        const parts = pathname.split("/").filter(Boolean);
        if (parts[0] !== "unidades") return null;
        return parts[1] ?? null;
    }, [pathname]);

    const unitFromPath = useMemo(() => findUnitBySlug(slugFromPath), [slugFromPath]);

    const storedSlug = useMemo(() => getStoredUnitSlug(), []);
    const unitFromStorage = useMemo(() => findUnitBySlug(storedSlug), [storedSlug]);

    const unit = unitFromPath ?? unitFromStorage;

    useEffect(() => {
        if (unitFromPath?.slug) setStoredUnitSlug(unitFromPath.slug);
    }, [unitFromPath?.slug]);

    return unit;
}
