import { MarketingNav } from "../marketing-client";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
    title: "Cookie Policy · Aura",
    description: "How Aura uses cookies.",
    path: "/cookies",
});

export default function CookiePage() {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const monthName = lastMonth.toLocaleString("default", { month: "long" });
    const year = lastMonth.getFullYear();

    return (
        <div className="min-h-screen bg-[#05050f] text-white">
            <MarketingNav />
            <div className="mx-auto max-w-3xl px-6 py-10">
                <h1 className="font-display text-3.5xl font-bold mb-8 leading-normal">Cookie Policy</h1>
                <p className="text-white/70"><em>Last updated: {monthName} {year}</em></p>
                <div className="space-y-4 text-white/70 leading-relaxed">
                    <p>
                        We use essential cookies for authentication and security. We do not use
                        tracking or advertising cookies.
                    </p>
                    <h2 className="text-xl font-semibold text-white mt-6">What we use</h2>
                    <ul className="list-disc list-inside">
                        <li>Session cookies for keeping you signed in</li>
                        <li>Preference cookies for remembering your dark mode setting</li>
                    </ul>
                    <p className="mt-4">
                        You can disable cookies in your browser settings, but some features may not
                        work properly.
                    </p>
                </div>
            </div>
        </div>
    );
}