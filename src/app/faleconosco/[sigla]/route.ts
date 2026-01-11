import { NextResponse } from "next/server";
import { resolveFaleConoscoDestination } from "@/lib/faleconoscoRedirect";

export function GET(_: Request, { params }: { params: { sigla: string } }) {
    const dest = resolveFaleConoscoDestination(params.sigla);
    if (!dest) return new Response("Not Found", { status: 404 });
    return NextResponse.redirect(dest, { status: 301 });
}
