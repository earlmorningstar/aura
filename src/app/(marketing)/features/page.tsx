import type { Metadata } from "next";
import { MarketingNav } from "../marketing-client";

export const metadata: Metadata = {
  title: "Features · Aura",
  description: "Everything you need to run your creator business from one dashboard.",
};

const features = [
  {
    title: "Revenue Dashboard",
    description: "Track all income streams — Stripe, Gumroad, affiliate — in a single real-time dashboard.",
  },
  {
    title: "Audience Analytics",
    description: "See follower growth, engagement rates, and top-performing content across platforms.",
  },
  {
    title: "Content Performance",
    description: "Understand which pieces drive the most revenue and followers, and optimise your strategy.",
  },
  {
    title: "AI-Powered Insights",
    description: "Get weekly summaries and ask Aura AI anything about your business — it's like a data co-founder.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-void)] text-white">
      <MarketingNav />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-display text-3.5xl font-bold mb-8 leading-normal">Features</h1>
        <p className="text-lg text-white/60 mb-12">
          Aura brings all your creator analytics into one beautiful glass dashboard.
        </p>
        <div className="grid gap-8 md:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur"
            >
              <h3 className="font-semibold text-xl mb-2">{f.title}</h3>
              <p className="text-white/60">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}