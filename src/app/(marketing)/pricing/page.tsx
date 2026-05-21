import { MarketingNav } from "../marketing-client";
import { CheckoutButton } from "./pricing-client";
import { AutoCheckout } from "./auto-checkout";
import { Suspense } from "react";
import { createMetadata } from "@/lib/metadata";


export const metadata = createMetadata({
  title: "Pricing · Aura",
  description: "Simple, transparent pricing for solo creators.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-void)] text-white">
      <MarketingNav />
      <div className="mx-auto max-w-4xl px-6 py-10 text-center">
        <h1 className="font-display text-3.5xl font-bold mb-8 leading-normal">Simple pricing</h1>
        <p className="text-lg text-white/60 mb-12">
          Start with a 14-day free trial, no credit card required. Cancel anytime.
        </p>
        <div className="flex justify-center gap-8 flex-wrap items-stretch">
          {/* Starter Card */}
          <div className="group relative overflow-hidden rounded-[32px] border border-cyan-400/15 bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-[1px] w-[340px] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 hover:border-cyan-400/30">

            {/* Glow */}
            <div className="absolute inset-0 bg-cyan-500/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

            {/* Content */}
            <div className="relative flex h-full flex-col rounded-[31px] bg-[#071018]/90 p-8">

              {/* Plan Badge */}
              <div className="mb-6 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5">
                  <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
                    Starter
                  </span>
                </div>

                <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/40">
                  Essential
                </div>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-end gap-1">
                  <span className="text-lg font-medium text-cyan-300">$</span>

                  <h3 className="text-6xl font-black tracking-tight text-white">
                    12
                  </h3>

                  <span className="mb-2 text-sm font-medium text-white/50">
                    /month
                  </span>
                </div>

                <div className="mt-2 h-px w-full bg-gradient-to-r from-cyan-400/30 via-cyan-400/5 to-transparent" />
              </div>

              {/* Description */}
              <p className="mb-8 text-sm leading-relaxed text-white/45">
                Perfect for independent creators building their audience and tracking early revenue growth.
              </p>

              {/* Features */}
              <ul className="mb-8 flex-1 space-y-4">
                {[
                  "Unlimited revenue tracking",
                  "Up to 3 platforms",
                  "Weekly AI insights",
                  "Basic content analytics",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-white/70"
                  >
                    <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10">
                      <span className="text-xs text-cyan-300">✓</span>
                    </div>

                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-auto">
                <CheckoutButton priceId="starter" label="Start Starter Trial" />
              </div>
            </div>
          </div>

          {/* Pro Card */}
          <div className="group relative overflow-visible rounded-[32px] border border-purple-400/20 bg-gradient-to-b from-purple-500/[0.12] via-white/[0.05] to-white/[0.02] p-[1px] w-[360px] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_0_80px_rgba(168,85,247,0.18)]">

            {/* Animated Glow */}
            <div className="absolute inset-0 bg-purple-500/10 opacity-60 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

            {/* Floating Most Popular Badge */}
            <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2">
              <div className="rounded-full border border-purple-300/20 bg-gradient-to-r from-purple-500 to-fuchsia-500 px-5 py-2 shadow-lg shadow-purple-500/20">
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-white">
                  Most Popular
                </span>
              </div>
            </div>

            {/* Inner Card */}
            <div className="relative flex h-full flex-col rounded-[31px] bg-[#0B0714]/92 p-9">

              {/* Header */}
              <div className="mb-6 flex items-center justify-between pt-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-1.5">
                  <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />

                  <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-purple-300">
                    Pro
                  </span>
                </div>

                <div className="rounded-full border border-purple-400/10 bg-purple-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-purple-200/70">
                  Best Value
                </div>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-end gap-1">
                  <span className="text-lg font-medium text-purple-300">$</span>

                  <h3 className="bg-gradient-to-b from-white to-purple-200 bg-clip-text text-7xl font-black tracking-tight text-transparent">
                    29
                  </h3>

                  <span className="mb-2 text-sm font-medium text-white/50">
                    /month
                  </span>
                </div>

                <div className="mt-2 h-px w-full bg-gradient-to-r from-purple-400/40 via-purple-400/10 to-transparent" />
              </div>

              {/* Description */}
              <p className="mb-8 text-sm leading-relaxed text-white/45">
                Advanced analytics and AI-powered insights for creators scaling serious digital businesses.
              </p>

              {/* Features */}
              <ul className="mb-8 flex-1 space-y-4">
                {[
                  "Everything in Starter",
                  "Unlimited platforms",
                  "Daily AI insights",
                  "Priority support",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-white/75"
                  >
                    <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border border-purple-400/20 bg-purple-500/10">
                      <span className="text-xs text-purple-200">✓</span>
                    </div>

                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-auto">
                <CheckoutButton priceId="pro" label="Start Pro Trial" />
              </div>
            </div>
          </div>
        </div>
        <Suspense fallback={null}>
          <AutoCheckout />
        </Suspense><p className="mt-8 text-sm text-white/40">No credit card required · Cancel any time · 14-day free trial</p>
      </div>
    </div>
  );
}