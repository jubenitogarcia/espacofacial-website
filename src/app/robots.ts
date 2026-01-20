import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://espacofacial.com";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                disallow: "/",
                allow: [
                    "/$",
                    "/novohamburgo$",
                    "/barrashoppingsul$",
                    "/robots.txt$",
                    "/sitemap.xml$",
                    "/_next/",
                    "/icon.svg$",
                    "/opengraph-image$",
                    "/twitter-image$",
                ],
            },
        ],
        sitemap: `${siteUrl.replace(/\/$/, "")}/sitemap.xml`,
    };
}
