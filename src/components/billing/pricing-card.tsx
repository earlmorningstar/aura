// "use client";

// import { GlassCard } from "@/components/ui/glass-card";
// import { GlassButton } from "@/components/ui/glass-button";

// interface PricingCardProps {
//   plan: string;
//   price: number;
//   period: string;
//   popular?: boolean;
//   onClick?: () => void;
// }

// export function PricingCard({ plan, price, period, popular = false, onClick }: PricingCardProps) {
//   return (
//     <GlassCard className={`p-8 ${popular ? "ring-2 ring-violet-400 scale-105" : ""}`}>
//       <div className="text-center">
//         <h3 className="text-2xl font-semibold">{plan}</h3>
//         <div className="my-6">
//           <span className="text-6xl font-semibold tracking-tighter">${price}</span>
//           <span className="text-zinc-400">/{period}</span>
//         </div>
//         <GlassButton className="w-full" onClick={onClick}>
//           {popular ? "Start 14-day Pro trial" : "Choose Plan"}
//         </GlassButton>
//       </div>
//     </GlassCard>
//   );
// }


"use client";

/**
 * PricingCard — plan card for the marketing/billing section.
 *
 * Features:
 * - Feature list with check icons
 * - "Most Popular" badge with spring entrance
 * - Popular card uses `glass-cyan` tint + glow shadow
 * - Framer Motion scale-in (not CSS transform)
 * - Annual / monthly billing toggle support via `billingCycle` prop
 * - Loading state on CTA button
 * - All colours from design tokens
 */

import * as React from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { AnimatedNumber } from "@/components/animated-wrapper";
import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────────────────── */

export type BillingCycle = "monthly" | "annual";

export interface PricingCardProps {
  /** Plan display name */
  plan: string;
  /** Monthly price in USD */
  monthlyPrice: number;
  /** Annual price per month (e.g. $19 for $228/yr) */
  annualPrice?: number;
  /** Billing cycle controlled externally */
  billingCycle?: BillingCycle;
  /** Short descriptor below the plan name */
  tagline?: string;
  /** Feature strings to render in the list */
  features?: string[];
  /** Mark as the highlighted "most popular" plan */
  popular?: boolean;
  /** CTA button label. Default: popular ? "Start free trial" : "Get started" */
  ctaLabel?: string;
  /** Loading state on the CTA button */
  loading?: boolean;
  /** Called when CTA is clicked */
  onClick?: () => void;
  /** Entrance animation delay in seconds */
  delay?: number;
  className?: string;
}

/* ─── Feature line ───────────────────────────────────────────────── */

function FeatureLine({ text, index, popular }: { text: string; index: number; popular: boolean }) {
  return (
    <motion.li
      className="flex items-start gap-2.5 text-sm"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 26,
        delay: 0.3 + index * 0.05,
      }}
    >
      {/* Check circle */}
      <span
        className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full"
        style={{
          background: popular
            ? "rgba(var(--accent-cyan-rgb) / 0.15)"
            : "rgba(var(--status-success-rgb) / 0.12)",
          border: `1px solid ${popular
            ? "rgba(var(--accent-cyan-rgb) / 0.25)"
            : "rgba(var(--status-success-rgb) / 0.2)"}`,
        }}
        aria-hidden
      >
        <Check
          size={10}
          strokeWidth={2.5}
          style={{ color: popular ? "var(--accent-cyan)" : "var(--status-success)" }}
        />
      </span>

      <span style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
        {text}
      </span>
    </motion.li>
  );
}

/* ─── PricingCard ────────────────────────────────────────────────── */

/**
 * @example
 * <PricingCard
 *   plan="Pro"
 *   monthlyPrice={29}
 *   annualPrice={19}
 *   billingCycle="annual"
 *   popular
 *   tagline="For serious creators"
 *   features={["Unlimited workspaces", "AI insights", "CSV export"]}
 *   onClick={handleUpgrade}
 * />
 */
export function PricingCard({
  plan,
  monthlyPrice,
  annualPrice,
  billingCycle = "monthly",
  tagline,
  features = [],
  popular = false,
  ctaLabel,
  loading = false,
  onClick,
  delay = 0,
  className,
}: PricingCardProps) {
  const displayPrice =
    billingCycle === "annual" && annualPrice !== undefined
      ? annualPrice
      : monthlyPrice;

  const annualSavings =
    annualPrice !== undefined
      ? Math.round(((monthlyPrice - annualPrice) / monthlyPrice) * 100)
      : 0;

  const defaultCta = popular ? "Start 14-day free trial" : "Get started";
  const buttonLabel = ctaLabel ?? defaultCta;

  return (
    <motion.div
      className={cn("relative flex flex-col", className)}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{
        opacity: 1,
        y: popular ? -6 : 0,   // Popular card floats slightly above siblings
        scale: popular ? 1.02 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 24,
        delay,
      }}
    >
      <GlassCard
        visual={popular ? "cyan" : "default"}
        padding="lg"
        className="flex h-full flex-col gap-6"
        style={popular ? { boxShadow: "var(--glow-cyan), var(--shadow-xl)" } : undefined}
      >
        {/* ── Popular badge ──────────────────────────────────── */}
        {popular && (
          <motion.div
            className="absolute -top-3.5 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 22, delay: delay + 0.15 }}
          >
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
              style={{
                background: "var(--gradient-brand)",
                color: "var(--color-bg-void)",
                boxShadow: "var(--glow-cyan)",
                fontFamily: "var(--font-display)",
                letterSpacing: "var(--tracking-snug)",
              }}
            >
              <Sparkles size={11} aria-hidden />
              Most Popular
            </div>
          </motion.div>
        )}

        {/* ── Plan name + tagline ────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2">
            {popular && (
              <motion.div
                className="flex h-6 w-6 items-center justify-center rounded-lg"
                style={{
                  background: "rgba(var(--accent-cyan-rgb) / 0.15)",
                  border: "1px solid rgba(var(--accent-cyan-rgb) / 0.25)",
                  color: "var(--accent-cyan)",
                }}
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ duration: 1.5, delay: delay + 0.5, repeat: Infinity, repeatDelay: 4 }}
              >
                <Zap size={12} aria-hidden />
              </motion.div>
            )}
            <h3
              className="font-display font-bold"
              style={{
                fontSize: "var(--text-xl)",
                letterSpacing: "var(--tracking-tight)",
                color: "var(--text-primary)",
              }}
            >
              {plan}
            </h3>
          </div>

          {tagline && (
            <p className="mt-1 text-sm" style={{ color: "var(--text-tertiary)" }}>
              {tagline}
            </p>
          )}
        </div>

        {/* ── Price ─────────────────────────────────────────── */}
        <div>
          <div className="flex items-end gap-1.5">
            <span
              className="font-display font-bold"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                letterSpacing: "var(--tracking-tight)",
                color: popular ? "var(--accent-cyan)" : "var(--text-primary)",
                lineHeight: 1,
              }}
            >
              $<AnimatedNumber value={displayPrice} delay={delay + 0.1} />
            </span>
            <span className="mb-1 text-sm" style={{ color: "var(--text-muted)" }}>
              / mo
            </span>
          </div>

          {/* Annual savings badge */}
          {billingCycle === "annual" && annualSavings > 0 && (
            <motion.p
              className="mt-2 text-xs font-medium"
              style={{ color: "var(--status-success)" }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 26, delay: delay + 0.25 }}
            >
              Save {annualSavings}% billed annually
            </motion.p>
          )}

          {billingCycle === "monthly" && annualPrice !== undefined && (
            <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
              Or ${annualPrice}/mo billed annually (save {annualSavings}%)
            </p>
          )}
        </div>

        {/* ── Divider ───────────────────────────────────────── */}
        <div
          className="h-px"
          style={{
            background: popular
              ? "rgba(var(--accent-cyan-rgb) / 0.15)"
              : "rgba(var(--glass-border-rgb) / 0.08)",
          }}
          aria-hidden
        />

        {/* ── Features ──────────────────────────────────────── */}
        {features.length > 0 && (
          <ul className="flex flex-1 flex-col gap-3" role="list" aria-label={`${plan} features`}>
            {features.map((f, i) => (
              <FeatureLine key={f} text={f} index={i} popular={popular} />
            ))}
          </ul>
        )}

        {/* ── CTA ───────────────────────────────────────────── */}
        <GlassButton
          variant={popular ? "primary" : "ghost"}
          size="md"
          className="w-full"
          loading={loading}
          onClick={onClick}
          aria-label={`${buttonLabel} — ${plan} plan`}
        >
          {buttonLabel}
        </GlassButton>
      </GlassCard>
    </motion.div>
  );
}

/* ─── BillingToggle (companion component) ────────────────────────── */

interface BillingToggleProps {
  value: BillingCycle;
  onChange: (v: BillingCycle) => void;
  /** Discount percentage label shown on annual option. e.g. 35 */
  annualDiscount?: number;
}

/**
 * BillingToggle — monthly/annual switcher, usually placed above a pricing grid.
 *
 * @example
 * const [cycle, setCycle] = useState<BillingCycle>("monthly");
 * <BillingToggle value={cycle} onChange={setCycle} annualDiscount={35} />
 */
export function BillingToggle({ value, onChange, annualDiscount }: BillingToggleProps) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-2xl p-1"
      style={{
        background: "rgba(var(--glass-bg-rgb) / 0.06)",
        border: "1px solid rgba(var(--glass-border-rgb) / 0.08)",
      }}
      role="group"
      aria-label="Billing cycle"
    >
      {(["monthly", "annual"] as BillingCycle[]).map((cycle) => {
        const isActive = value === cycle;
        return (
          <motion.button
            key={cycle}
            className="relative flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium capitalize outline-none focus-visible:ring-2 focus-visible:ring-aura-cyan/60"
            style={{ color: isActive ? "var(--text-primary)" : "var(--text-tertiary)" }}
            onClick={() => onChange(cycle)}
            whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 600, damping: 28 } }}
          >
            {isActive && (
              <motion.span
                layoutId="billing-cycle-pill"
                className="absolute inset-0 rounded-xl"
                style={{
                  background: "rgba(var(--glass-bg-rgb) / 0.12)",
                  border: "1px solid rgba(var(--glass-border-rgb) / 0.12)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{cycle}</span>

            {/* Annual discount badge */}
            {cycle === "annual" && annualDiscount && (
              <motion.span
                className="relative z-10 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                style={{
                  background: "rgba(var(--status-success-rgb) / 0.12)",
                  color: "var(--status-success)",
                  border: "1px solid rgba(var(--status-success-rgb) / 0.2)",
                }}
                animate={{ scale: isActive ? [1, 1.08, 1] : 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                -{annualDiscount}%
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}