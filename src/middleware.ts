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

    if (!isPublicAsset(url.pathname)) {
        const pathname = url.pathname.replace(/\/+$/, "") || "/";

        const simpleRedirects: Record<string, string> = {
            "/sobre": "#doutores",
            "/unidades": "#unidades",
            "/termos": "#termos",
            "/doutores": "#doutores",
            "/agendamento": "#unidades",
        };

        if (simpleRedirects[pathname]) {
            url.pathname = "/";
            url.hash = simpleRedirects[pathname];
            return NextResponse.redirect(url, 308);
        }

        const unitMatch = pathname.match(/^\/unidades\/([^/]+)$/);
        if (unitMatch) {
            url.pathname = "/";
            url.hash = `#unit-${unitMatch[1]}`;
            return NextResponse.redirect(url, 308);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/:path*"],
};
