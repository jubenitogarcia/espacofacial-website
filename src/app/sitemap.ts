import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://espacofacial.com").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: `${siteUrl}/`, lastModified: now },
        { url: `${siteUrl}/novohamburgo`, lastModified: now },
        { url: `${siteUrl}/barrashoppingsul`, lastModified: now },
    ];

    return staticRoutes;
}
