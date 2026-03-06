"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import { campaignParamsForEvent } from "@/lib/campaign";

type ExperienceTrackerProps = {
    page: string;
    experience: string;
    variant: string;
};

function sanitizeVariant(value: string): string {
    const cleaned = value.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
    return cleaned || "default";
}

function resolveVariant(page: string, fallback: string): { variant: string; source: string } {
    if (typeof window === "undefined") {
        return { variant: sanitizeVariant(fallback), source: "default" };
    }

    const storageKey = `ef_experience_variant:${page}`;

    try {
        const params = new URLSearchParams(window.location.search);
        const explicitVariant = params.get("ef_variant") ?? params.get("variant");
        if (explicitVariant && explicitVariant.trim()) {
            const variant = sanitizeVariant(explicitVariant);
            window.sessionStorage.setItem(storageKey, variant);
            return { variant, source: "query" };
        }
    } catch {
        // noop
    }

    try {
        const campaign = campaignParamsForEvent();
        const utmContent = typeof campaign.utm_content === "string" ? campaign.utm_content : "";
        if (utmContent.trim()) {
            const variant = `campaign-${sanitizeVariant(utmContent)}`;
            window.sessionStorage.setItem(storageKey, variant);
            return { variant, source: "campaign" };
        }
    } catch {
        // noop
    }

    try {
        const storedVariant = window.sessionStorage.getItem(storageKey);
        if (storedVariant && storedVariant.trim()) {
            return { variant: sanitizeVariant(storedVariant), source: "session" };
        }
    } catch {
        // noop
    }

    const variant = sanitizeVariant(fallback);
    try {
        window.sessionStorage.setItem(storageKey, variant);
    } catch {
        // noop
    }
    return { variant, source: "default" };
}

export default function ExperienceTracker({ page, experience, variant }: ExperienceTrackerProps) {
    useEffect(() => {
        const resolved = resolveVariant(page, variant);
        trackEvent("landing_experience_view", {
            page,
            experience,
            variant: resolved.variant,
            variantSource: resolved.source,
            experienceKey: `${page}:${experience}`,
        });
    }, [experience, page, variant]);

    return null;
}
