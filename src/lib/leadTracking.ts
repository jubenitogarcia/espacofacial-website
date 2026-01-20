import { trackEvent, type AnalyticsEventParams } from "@/lib/analytics";
import { campaignParamsForEvent } from "@/lib/campaign";

export type LeadPlacement =
    | "header"
    | "floating"
    | "about"
    | "doctor"
    | "unit_modal"
    | "doctor_grid"
    | "unknown";

function landingPeriodUtc(): string {
    const d = new Date();
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
}

function withCampaign(params: AnalyticsEventParams): AnalyticsEventParams {
    const campaign = campaignParamsForEvent();
    return { ...campaign, landingPeriod: landingPeriodUtc(), ...params };
}

export function trackAgendarClick(params: {
    placement: LeadPlacement;
    unitSlug: string | null;
    doctorName?: string;
    whatsappUrl?: string;
}) {
    const payload: AnalyticsEventParams = withCampaign({
        placement: params.placement,
        unitSlug: params.unitSlug,
        destination: "whatsapp",
    });

    if (params.doctorName) payload.doctorName = params.doctorName;
    if (params.whatsappUrl) payload.whatsappUrl = params.whatsappUrl;

    trackEvent("cta_agendar_click", payload);
}

export function trackDoctorWhatsappClick(params: {
    unitSlug: string | null;
    doctorName: string;
    unitSigla: string;
    whatsappUrl: string;
}) {
    trackEvent("doctor_whatsapp_click", {
        ...withCampaign(params),
    });
}

export function trackDoctorInstagramClick(params: {
    unitSlug: string | null;
    doctorName: string;
    instagramUrl: string;
}) {
    trackEvent("doctor_instagram_click", {
        ...withCampaign(params),
    });
}

export function trackCtaInstagramClick(params: {
    placement: LeadPlacement;
    unitSlug: string | null;
    instagramUrl: string;
}) {
    trackEvent(
        "cta_instagram_click",
        withCampaign({
            placement: params.placement,
            unitSlug: params.unitSlug,
            instagramUrl: params.instagramUrl,
        })
    );
}

export function trackHeaderInstagramOpen(params: { unitSlug: string | null; mode: "direct" | "picker" }) {
    trackEvent("header_instagram_open", withCampaign(params));
}

export function trackHeaderInstagramClick(params: { unitSlug: string | null; mode: "direct" | "picker" }) {
    trackEvent("header_instagram_click", withCampaign(params));
}
