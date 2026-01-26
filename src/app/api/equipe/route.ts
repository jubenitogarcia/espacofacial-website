import { NextResponse } from "next/server";
import { fetchActiveInjectors } from "@/lib/injectorsDirectory";

export async function GET() {
    try {
        const members = await fetchActiveInjectors();
        return NextResponse.json({ members }, { status: 200 });
    } catch {
        return NextResponse.json({ members: [], error: "exception" }, { status: 200 });
    }
}
