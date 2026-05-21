import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aura-ai-dash.vercel.app";
    const pages = [
        { path: "", priority: 1 },
        { path: "/features", priority: 0.9 },
        { path: "/pricing", priority: 0.9 },
        { path: "/blog", priority: 0.7 },
        { path: "/about", priority: 0.6 },
        { path: "/contact", priority: 0.6 },
        { path: "/privacy", priority: 0.4 },
        { path: "/terms", priority: 0.4 },
    ];

    return pages.map(({ path, priority }) => ({
        url: `${siteUrl}${path}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority,
    }));
}