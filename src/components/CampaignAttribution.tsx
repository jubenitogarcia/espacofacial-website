"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { extractCampaignParamsFromSearchParams, persistCampaignParams } from "@/lib/campaign";

export default function CampaignAttribution() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const params = extractCampaignParamsFromSearchParams(new URLSearchParams(searchParams.toString()));
        persistCampaignParams(params);
    }, [searchParams]);

    return null;
}
