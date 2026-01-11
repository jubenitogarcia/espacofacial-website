import type { MetadataRoute } from "next";
import { units } from "@/data/units";
import { doctors } from "@/data/doctors";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://espacofacial.com").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: `${siteUrl}/`, lastModified: now },
        { url: `${siteUrl}/unidades`, lastModified: now },
        { url: `${siteUrl}/doutores`, lastModified: now },
        { url: `${siteUrl}/sobre`, lastModified: now },
        { url: `${siteUrl}/termos`, lastModified: now },
    ];

    const unitRoutes: MetadataRoute.Sitemap = units.map((u) => ({
        url: `${siteUrl}/unidades/${u.slug}`,
        lastModified: now,
    }));

    const doctorRoutes: MetadataRoute.Sitemap = doctors.map((d) => ({
        url: `${siteUrl}/doutores/${d.slug}`,
        lastModified: now,
    }));

    return [...staticRoutes, ...unitRoutes, ...doctorRoutes];
}
