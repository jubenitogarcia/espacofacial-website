import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://espacofacial.com").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: `${siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
        { url: `${siteUrl}/novohamburgo`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
        { url: `${siteUrl}/barrashoppingsul`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ];

    return staticRoutes;
}
