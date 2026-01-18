import type { MetadataRoute } from "next";
import { doctors } from "@/data/doctors";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://espacofacial.com").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: `${siteUrl}/`, lastModified: now },
    ];

    const doctorRoutes: MetadataRoute.Sitemap = doctors.map((d) => ({
        url: `${siteUrl}/doutores/${d.slug}`,
        lastModified: now,
    }));

    return [...staticRoutes, ...doctorRoutes];
}
