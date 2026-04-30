import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/lib/query-client";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "Aura — Personal Analytics Dashboard",
    template: "%s · Aura",
  },
  description:
    "Your entire creator business in one beautiful glass dashboard. Revenue, audience, and content analytics at a glance.",
  keywords: [
    "creator analytics",
    "solopreneur dashboard",
    "revenue tracking",
    "audience growth",
    "content performance",
  ],
  authors: [{ name: "Aura" }],
  creator: "Aura",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://useaura.app",
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Aura",
    title: "Aura — Personal Analytics Dashboard",
    description:
      "Your entire creator business in one beautiful glass dashboard.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Aura Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aura — Personal Analytics Dashboard",
    description:
      "Your entire creator business in one beautiful glass dashboard.",
    images: ["/og-image.png"],
  },
  robots: {
    index: false, 
    follow: false,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#030305",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}