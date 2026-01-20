import { NextResponse } from "next/server";
import { resolveFaleConoscoDestination } from "@/lib/faleconoscoRedirect";
import { mergeCampaignParamsIntoUrl } from "@/lib/mergeCampaignParams";

export function GET(req: Request, { params }: { params: { sigla: string } }) {
    const dest = resolveFaleConoscoDestination(params.sigla);
    if (!dest) return new Response("Not Found", { status: 404 });
    const redirectUrl = mergeCampaignParamsIntoUrl(dest, req.url);
    return NextResponse.redirect(redirectUrl, { status: 301 });
}
