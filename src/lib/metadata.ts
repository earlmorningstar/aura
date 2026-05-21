import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aura-ai-dash.vercel.app";

export function createMetadata({
    title,
    description,
    path = "",
}: {
    title: string;
    description: string;
    path?: string;
}): Metadata {
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `${SITE_URL}${path}`,
            siteName: "Aura",
            images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
            locale: "en_US",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [`${SITE_URL}/og-image.png`],
        },
        alternates: {
            canonical: `${SITE_URL}${path}`,
        },
    };
}