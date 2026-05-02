import type { Metadata } from "next";
import { MarketingNav } from "../marketing-client";

export const metadata: Metadata = {
    title: "Documentation · Aura",
    description: "Learn how to get the most out of Aura.",
};

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-[#05050f] text-white">
            <MarketingNav />
            <div className="mx-auto max-w-3xl px-6 py-24">
                <h1 className="font-display text-4xl font-bold mb-6">Documentation</h1>
                <p className="text-white/70 mb-8">
                    Full documentation is coming soon. In the meantime, here are some quick
                    start guides:
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                    {["Connect Stripe", "Add a workspace", "Read your AI insights"].map((title) => (
                        <div
                            key={title}
                            className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <h3 className="font-semibold">{title}</h3>
                            <p className="text-sm text-white/60 mt-1">Step-by-step instructions</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}