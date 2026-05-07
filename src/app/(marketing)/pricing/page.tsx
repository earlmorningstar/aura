import type { Metadata } from "next";
import { MarketingNav } from "../marketing-client";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing · Aura",
  description: "Simple, transparent pricing for solo creators.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-void)] text-white">
      <MarketingNav />
      <div className="mx-auto max-w-4xl px-6 py-10 text-center">
        <h1 className="font-display text-3.5xl font-bold mb-8 leading-normal">Simple pricing</h1>
        <p className="text-lg text-white/60 mb-12">
          Start with a 14-day free trial, no credit card required. Cancel anytime.
        </p>
        <div className="flex justify-center gap-6 flex-wrap">
          <div className="rounded-2xl border border-cyan-500/20 bg-white/5 p-8 w-80 backdrop-blur">
            <p className="text-sm uppercase tracking-wide text-cyan-400 mb-4">Starter</p>
            <p className="text-5xl font-bold mb-6">$12<span className="text-lg text-white/40">/mo</span></p>
            <ul className="text-left text-white/60 space-y-2 mb-8">
              <li>✓ Unlimited revenue tracking</li>
              <li>✓ Up to 3 platforms</li>
              <li>✓ Weekly AI insights</li>
              <li>✓ Basic content analytics</li>
            </ul>
            <Link
              href="/login"
              className="block w-full rounded-xl bg-cyan-400 px-6 py-3 text-center font-semibold text-black hover:bg-cyan-300 transition-colors"
            >
              Start free trial
            </Link>
          </div>
          <div className="rounded-2xl border border-purple-500/20 bg-white/5 p-8 w-80 backdrop-blur">
            <p className="text-sm uppercase tracking-wide text-purple-400 mb-4">Pro</p>
            <p className="text-5xl font-bold mb-6">$29<span className="text-lg text-white/40">/mo</span></p>
            <ul className="text-left text-white/60 space-y-2 mb-8">
              <li>✓ Everything in Starter</li>
              <li>✓ Unlimited platforms</li>
              <li>✓ Daily AI insights</li>
              <li>✓ Priority support</li>
            </ul>
            <Link
              href="/login"
              className="block w-full rounded-xl bg-purple-400 px-6 py-3 text-center font-semibold text-black hover:bg-purple-300 transition-colors"
            >
              Start free trial
            </Link>
          </div>
        </div>
        <p className="mt-8 text-sm text-white/40">No credit card required · Cancel any time · 14-day free trial</p>
      </div>
    </div>
  );
}