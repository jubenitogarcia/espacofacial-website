import { NextResponse, type NextRequest } from "next/server";

function isPublicAsset(pathname: string): boolean {
    return (
        pathname.startsWith("/_next/") ||
        pathname.startsWith("/images/") ||
        pathname === "/favicon.ico" ||
        pathname === "/icon.svg"
    );
}

export function middleware(req: NextRequest) {
    const host = req.headers.get("host") ?? "";
    const url = req.nextUrl.clone();

    if (!isPublicAsset(url.pathname) && host.startsWith("www.")) {
        url.host = host.replace(/^www\./, "");
        return NextResponse.redirect(url, 308);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/:path*"],
};
