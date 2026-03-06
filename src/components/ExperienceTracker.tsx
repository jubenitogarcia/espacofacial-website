"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

type ExperienceTrackerProps = {
    page: string;
    experience: string;
    variant: string;
};

export default function ExperienceTracker({ page, experience, variant }: ExperienceTrackerProps) {
    useEffect(() => {
        trackEvent("landing_experience_view", {
            page,
            experience,
            variant,
        });
    }, [experience, page, variant]);

    return null;
}
