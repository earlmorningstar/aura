import { MarketingNav } from "../marketing-client";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
    title: "About · Aura",
    description: "Our mission is to give every solo creator a clear view of their business.",
    path: "/about",
});

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#05050f] text-white">
            <MarketingNav />
            <div className="mx-auto max-w-3xl px-6 py-10">
                <h1 className="font-display text-3.5xl font-bold mb-8 leading-normal">About Aura</h1>
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