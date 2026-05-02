import type { Metadata } from "next";
import { MarketingNav } from "../marketing-client";

export const metadata: Metadata = {
    title: "About · Aura",
    description: "Our mission is to give every solo creator a clear view of their business.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#05050f] text-white">
            <MarketingNav />
            <div className="mx-auto max-w-3xl px-6 py-24">
                <h1 className="font-display text-4xl font-bold mb-6">About Aura</h1>
                <div className="space-y-4 text-white/70 leading-relaxed">
                    <p>
                        Aura was built by a small team of creators who were tired of jumping between
                        Stripe, Gumroad, YouTube Studio, and five different spreadsheets just to
                        understand how their business was doing.
                    </p>
                    <p>
                        We wanted one beautiful place where revenue, audience, and content analytics
                        live together—so we built it. Aura is now used by thousands of creators,
                        from YouTubers to newsletter authors, to track over $4 million in revenue.
                    </p>
                    <p>
                        Our mission is simple: give every solo creator the same data superpowers
                        that big media companies have, without the complexity.
                    </p>
                </div>
            </div>
        </div>
    );
}