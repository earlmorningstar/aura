"use client";

/**
 * Marketing client components — interactive portions of the landing page.
 *
 * Separated from page.tsx so the page shell stays a Server Component
 * while we get Framer Motion entrance animations here.
 */

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  FileText,
  Sparkles,
  BarChart2,
  Shield,
  Zap,
  ArrowRight,
} from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import { AnimatedWrapper, AnimatedGroup, AnimatedItem } from "@/components/animated-wrapper";

/* ─── MarketingNav ───────────────────────────────────────────────── */

export function MarketingNav() {
  return (
    <motion.header
      className="fixed left-0 right-0 top-0 z-[var(--z-sticky)] flex items-center justify-between px-6 py-4 md:px-12"
      style={{
        background: "rgba(var(--glass-bg-rgb) / 0.04)",
        backdropFilter: "blur(var(--glass-blur-md)) saturate(160%)",
        WebkitBackdropFilter: "blur(var(--glass-blur-md)) saturate(160%)",
        borderBottom: "1px solid rgba(var(--glass-border-rgb) / 0.06)",
        boxShadow: "0 4px 24px -8px rgba(0,0,0,0.3)",
      }}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-aura-cyan/60 rounded-lg">
        <motion.div
          className="flex h-8 w-8 items-center justify-center rounded-xl font-display text-xs font-black"
          style={{ background: "var(--gradient-brand)", color: "var(--color-bg-void)" }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
        >
          A
        </motion.div>
        <span
          className="font-display text-xl font-bold"
          style={{ letterSpacing: "var(--tracking-tight)", color: "var(--text-primary)" }}
        >
          aura
        </span>
      </Link>

      {/* Nav links */}
      <nav className="hidden items-center gap-6 md:flex" aria-label="Marketing navigation">
        {["Features", "Pricing", "Blog"].map((label) => (
          <Link
            key={label}
            href={`/${label.toLowerCase()}`}
            className="text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-aura-cyan/60 rounded"
            style={{ color: "var(--text-secondary)" }}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* CTAs */}
      <div className="flex items-center gap-3">
        <GlassButton variant="ghost" size="sm" asChild>
          <Link href="/login">Sign in</Link>
        </GlassButton>
        <GlassButton variant="primary" size="sm" asChild>
          <Link href="/login">Start free trial</Link>
        </GlassButton>
      </div>
    </motion.header>
  );
}

/* ─── MarketingHero ──────────────────────────────────────────────── */

export function MarketingHero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pb-24 pt-32 text-center md:px-12">
      <AnimatedGroup stagger={0.08} delayChildren={0.1} className="flex flex-col items-center gap-0">
        {/* Eyebrow badge */}
        <AnimatedItem variant="scaleIn">
          <div
            className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
            style={{
              background: "rgba(var(--accent-cyan-rgb) / 0.08)",
              border: "1px solid rgba(var(--accent-cyan-rgb) / 0.2)",
              color: "var(--accent-cyan)",
              letterSpacing: "var(--tracking-wide)",
            }}
          >
            <Sparkles size={12} aria-hidden />
            NOW IN OPEN BETA
          </div>
        </AnimatedItem>

        {/* Headline */}
        <AnimatedItem variant="fadeUp">
          <h1
            className="font-display font-bold"
            style={{
              fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
              letterSpacing: "var(--tracking-tight)",
              lineHeight: 1.05,
              color: "var(--text-primary)",
              maxWidth: "16ch",
            }}
          >
            Your entire creator business.{" "}
            <span className="text-gradient">One glass dashboard.</span>
          </h1>
        </AnimatedItem>

        {/* Sub-copy */}
        <AnimatedItem variant="fadeUp">
          <p
            className="mt-6 max-w-xl text-lg leading-relaxed md:text-xl"
            style={{ color: "var(--text-secondary)" }}
          >
            Finally stop switching tabs. Revenue, audience, and content analytics
            unified in one beautiful, AI-powered place.
          </p>
        </AnimatedItem>

        {/* CTAs */}
        <AnimatedItem variant="fadeUp">
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <GlassButton
              variant="primary"
              size="lg"
              trailingIcon={<ArrowRight size={16} />}
              asChild
            >
              <Link href="/login">Start 14-day Pro trial</Link>
            </GlassButton>

            <Link
              href="/login?signup=true"
              className="flex items-center gap-2 rounded-2xl border px-8 py-3.5 text-base font-medium outline-none focus-visible:ring-2 focus-visible:ring-aura-cyan/60"
              style={{
                borderColor: "rgba(var(--glass-border-rgb) / 0.12)",
                color: "var(--text-secondary)",
                background: "rgba(var(--glass-bg-rgb) / 0.04)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              Get started free
            </Link>
          </div>
        </AnimatedItem>

        {/* Social proof strip */}
        <AnimatedItem variant="fadeUp">
          <p className="mt-6 text-sm" style={{ color: "var(--text-secondary)" }}>
            No credit card required · Cancel any time · 14-day free trial
          </p>
        </AnimatedItem>
      </AnimatedGroup>

      {/* Dashboard preview mockup */}
      <AnimatedWrapper variant="fadeUp" delay={0.5} className="mt-20 w-full max-w-5xl">
        <div
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: "rgba(var(--glass-bg-rgb) / 0.05)",
            backdropFilter: "blur(var(--glass-blur-md))",
            WebkitBackdropFilter: "blur(var(--glass-blur-md))",
            border: "1px solid rgba(var(--glass-border-rgb) / 0.10)",
            boxShadow:
              "0 32px 80px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(var(--accent-cyan-rgb) / 0.05) inset",
          }}
        >
          {/* Fake topbar */}
          <div
            className="flex items-center gap-3 px-6 py-4"
            style={{ borderBottom: "1px solid rgba(var(--glass-border-rgb) / 0.08)" }}
          >
            <div className="h-2.5 w-16 rounded-full" style={{ background: "rgba(var(--glass-bg-rgb) / 0.3)" }} />
            <div className="ml-auto flex gap-2">
              <div className="h-2.5 w-20 rounded-full" style={{ background: "rgba(var(--glass-bg-rgb) / 0.2)" }} />
              <div className="h-2.5 w-8 rounded-full" style={{ background: "var(--accent-cyan)", opacity: 0.5 }} />
            </div>
          </div>

          {/* KPI cards row */}
          <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
            {[
              { label: "Total Revenue", value: "$14,892", change: "+18.4%", color: "var(--accent-cyan)" },
              { label: "MRR", value: "$3,240", change: "+4.2%", color: "var(--accent-purple)" },
              { label: "Followers", value: "15.6K", change: "+8.4%", color: "var(--status-success)" },
              { label: "Engagement", value: "4.8%", change: "−0.3%", color: "var(--accent-amber)" },
            ].map((kpi, i) => (
              <motion.div
                key={kpi.label}
                className="flex flex-col gap-2 rounded-2xl p-4"
                style={{
                  background: "rgba(var(--glass-bg-rgb) / 0.08)",
                  border: "1px solid rgba(var(--glass-border-rgb) / 0.1)",
                }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.7 + i * 0.1 }}
              >
                <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {kpi.label}
                </span>
                <span
                  className="font-display text-xl font-bold"
                  style={{ letterSpacing: "var(--tracking-tight)", color: "var(--text-primary)" }}
                >
                  {kpi.value}
                </span>
                <span className="text-[11px] font-semibold" style={{ color: kpi.change.startsWith("+") ? "var(--status-success)" : "var(--status-error)" }}>
                  {kpi.change}
                </span>
                {/* Mini sparkline bars */}
                <div className="mt-2 flex items-end gap-0.5" style={{ height: "20px" }}>
                  {[40, 60, 35, 80, 55, 90, 70, 50, 75, 85].map((h, j) => (
                    <div
                      key={j}
                      className="flex-1 rounded-t-sm"
                      style={{ height: `${h}%`, background: kpi.color, opacity: 0.3 + j * 0.05 }}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedWrapper>
    </section>
  );
}

/* ─── FeatureGrid ────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Revenue tracking",
    description: "See every dollar from Stripe, Gumroad, affiliates, and more in a single view.",
    color: "var(--accent-cyan)",
    rgb: "var(--accent-cyan-rgb)",
  },
  {
    icon: Users,
    title: "Audience growth",
    description: "Monitor follower growth across YouTube, Twitter, and your newsletter simultaneously.",
    color: "var(--accent-purple)",
    rgb: "var(--accent-purple-rgb)",
  },
  {
    icon: FileText,
    title: "Content performance",
    description: "Know exactly which posts drive revenue so you never waste time on the wrong content.",
    color: "var(--status-success)",
    rgb: "var(--status-success-rgb)",
  },
  {
    icon: Sparkles,
    title: "AI insights",
    description: "Actionable weekly recommendations from your personal AI cofounder.",
    color: "var(--accent-amber)",
    rgb: "var(--accent-amber-rgb)",
  },
  {
    icon: BarChart2,
    title: "Beautiful charts",
    description: "Glassmorphic, animated charts that make understanding your data a pleasure.",
    color: "var(--accent-pink)",
    rgb: "var(--accent-pink-rgb)",
  },
  {
    icon: Shield,
    title: "Secure by default",
    description: "Row-level security on every query. Your data never leaves your Supabase instance.",
    color: "var(--accent-cyan)",
    rgb: "var(--accent-cyan-rgb)",
  },
] as const;

export function FeatureGrid() {
  return (
    <section className="px-6 pb-24 md:px-12">
      <AnimatedWrapper variant="fadeUp" viewport={{ once: true }} className="mb-16 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            background: "rgba(var(--accent-purple-rgb) / 0.08)",
            border: "1px solid rgba(var(--accent-purple-rgb) / 0.2)",
            color: "var(--accent-purple)",
            letterSpacing: "var(--tracking-wide)",
          }}
        >
          <Zap size={11} aria-hidden /> FEATURES
        </div>
        <h2
          className="font-display font-bold"
          style={{
            fontSize: "clamp(1.75rem, 4vw, 3rem)",
            letterSpacing: "var(--tracking-tight)",
            color: "var(--text-primary)",
          }}
        >
          Everything you need, nothing you don&rsquo;t
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-base" style={{ color: "var(--text-secondary)" }}>
          Aura brings together revenue, audience, and content analytics in one place — so you can stop
          jumping between tabs and spend more time creating.
        </p>
      </AnimatedWrapper>

      <AnimatedGroup
        stagger={0.08}
        delayChildren={0.1}
        className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <AnimatedItem key={f.title} variant="fadeUp" className="h-full">
              <motion.div
                className="flex flex-col gap-4 rounded-2xl p-6 h-full"
                style={{
                  background: "rgba(var(--glass-bg-rgb) / 0.05)",
                  backdropFilter: "blur(var(--glass-blur-sm))",
                  WebkitBackdropFilter: "blur(var(--glass-blur-sm))",
                  border: "1px solid rgba(var(--glass-border-rgb) / 0.08)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
                whileHover={{
                  background: "rgba(var(--glass-bg-rgb) / 0.08)",
                  borderColor: "rgba(var(--glass-border-rgb) / 0.14)",
                  y: -3,
                  transition: { type: "spring", stiffness: 400, damping: 26 },
                }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    background: `rgba(${f.rgb} / 0.12)`,
                    border: `1px solid rgba(${f.rgb} / 0.2)`,
                    color: f.color,
                  }}
                >
                  <Icon size={18} aria-hidden />
                </div>
                <div>
                  <h3
                    className="font-display font-semibold"
                    style={{ color: "var(--text-primary)", letterSpacing: "var(--tracking-snug)" }}
                  >
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                    {f.description}
                  </p>
                </div>
              </motion.div>
            </AnimatedItem>
          );
        })}
      </AnimatedGroup>
    </section>
  );
}

/* ─── SocialProof ────────────────────────────────────────────────── */

export function SocialProof() {
  const stats = [
    {
      value: "2,400+",
      label: "creators building on Aura",
      sub: "from solo YouTubers to six‑figure newsletter authors",
    },
    {
      value: "$4.2M",
      label: "revenue tracked to date",
      sub: "across Stripe, Gumroad, affiliates and more",
    },
    {
      value: "14‑day",
      label: "free Pro trial",
      sub: "all features · no credit card · cancel anytime",
    },
    {
      value: "4.9 / 5",
      label: "average rating",
      sub: "based on 200+ reviews from early creators",
    },
  ];

  return (
    <section className="px-6 pb-24 md:px-12">
      <AnimatedGroup
        stagger={0.07}
        className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4"
      >
        {stats.map((stat) => (
          <AnimatedItem key={stat.label} variant="scaleIn" className="h-full">
            <motion.div
              className="flex flex-col gap-1.5 rounded-2xl p-6 h-full"
              style={{
                background: "rgba(var(--glass-bg-rgb) / 0.05)",
                backdropFilter: "blur(var(--glass-blur-sm))",
                WebkitBackdropFilter: "blur(var(--glass-blur-sm))",
                border: "1px solid rgba(var(--glass-border-rgb) / 0.08)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
              whileHover={{
                background: "rgba(var(--glass-bg-rgb) / 0.08)",
                borderColor: "rgba(var(--glass-border-rgb) / 0.14)",
                y: -3,
                transition: { type: "spring", stiffness: 400, damping: 26 },
              }}
            >
              {/* Accent dash */}
              <span
                className="mx-auto mb-1 h-1 w-6 rounded-full"
                style={{ background: "var(--accent-cyan)" }}
                aria-hidden
              />
              <span
                className="font-display font-bold text-center"
                style={{
                  fontSize: "var(--text-2xl)",
                  letterSpacing: "var(--tracking-tight)",
                  color: "var(--text-primary)",
                }}
              >
                {stat.value}
              </span>
              <span
                className="text-xs font-medium text-center"
                style={{ color: "var(--text-secondary)" }}
              >
                {stat.label}
              </span>
              <span
                className="text-[11px] leading-relaxed text-center"
                style={{ color: "var(--text-muted)" }}
              >
                {stat.sub}
              </span>
            </motion.div>
          </AnimatedItem>
        ))}
      </AnimatedGroup>
    </section>
  );
}

/* ─── How It Works ────────────────────────────────────────────────── */

const STEPS = [
  {
    step: "01",
    title: "Connect your platforms",
    description: "Link your Stripe, Gumroad, YouTube, and newsletter in one click. No code required.",
  },
  {
    step: "02",
    title: "See your unified dashboard",
    description: "All revenue, audience, and content analytics appear in a single glass‑morphic view.",
  },
  {
    step: "03",
    title: "Act on AI insights",
    description: "Aura highlights your biggest opportunities and warns you about dips before they hurt.",
  },
];

export function HowItWorks() {
  return (
    <section className="px-6 pb-24 md:px-12">
      <AnimatedWrapper variant="fadeUp" className="mb-16 text-center">
        <h2 className="font-display font-bold text-3xl md:text-4xl leading-normal" style={{
          fontSize: "clamp(1.75rem, 4vw, 3rem)",
          letterSpacing: "var(--tracking-tight)",
          color: "var(--text-primary)", lineHeight: "1.25"
        }}>
          How it works
        </h2>
        <p className="mt-4 text-base" style={{ color: "var(--text-secondary)" }}>
          Get from sign‑up to actionable insights in under three minutes.
        </p>
      </AnimatedWrapper>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <AnimatedItem key={s.step} variant="fadeUp" className="h-full">
            <motion.div
              className="flex flex-col items-start gap-4 rounded-2xl p-6 h-full"
              style={{
                background: "rgba(var(--glass-bg-rgb) / 0.05)",
                backdropFilter: "blur(var(--glass-blur-sm))",
                border: "1px solid rgba(var(--glass-border-rgb) / 0.08)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
              whileHover={{ y: -4 }}
            >
              <span
                className="font-display text-3xl font-bold"
                style={{ color: "var(--accent-cyan)" }}
              >
                {s.step}
              </span>
              <h3 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                {s.description}
              </p>
            </motion.div>
          </AnimatedItem>
        ))}
      </div>
    </section>
  );
}

/* ─── Testimonials ────────────────────────────────────────────────── */

const TESTIMONIALS = [
  {
    quote: "Aura replaced three separate tools for me. Now I spend more time creating and less time spreadsheeting.",
    author: "Maya K.",
    handle: "YouTuber, 240K subscribers",
  },
  {
    quote: "The AI insights are scary accurate. It told me to double down on long‑form video, and my revenue jumped 30% the next month.",
    author: "Jordan P.",
    handle: "Course creator & newsletter author",
  },
  {
    quote: "Finally, a dashboard that doesn't look like it was built in 2005. The glassmorphism is *chef's kiss*.",
    author: "Alex R.",
    handle: "SaaS founder & content creator",
  },
];

export function Testimonials() {
  return (
    <section className="px-6 pb-24 md:px-12">
      <AnimatedWrapper variant="fadeUp" className="mb-16 text-center">
        <h2 className="font-display font-bold text-3xl md:text-4xl leading-normal" style={{
          fontSize: "clamp(1.75rem, 4vw, 3rem)",
          letterSpacing: "var(--tracking-tight)",
          color: "var(--text-primary)", lineHeight: "1.25"
        }}>Loved by creators
        </h2>
        <p className="mt-4 text-base" style={{ color: "var(--text-secondary)" }}>
          Join thousands of creators who've already upgraded their analytics.
        </p>
      </AnimatedWrapper>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <AnimatedItem key={i} variant="fadeUp" className="h-full">
            <motion.div
              className="flex flex-col justify-between rounded-2xl p-6 h-full"
              style={{
                background: "rgba(var(--glass-bg-rgb) / 0.05)",
                backdropFilter: "blur(var(--glass-blur-sm))",
                border: "1px solid rgba(var(--glass-border-rgb) / 0.08)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
              whileHover={{ y: -3 }}
            >
              <p className="text-sm leading-relaxed italic" style={{ color: "var(--text-secondary)" }}>
                “{t.quote}”
              </p>
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                  {t.author}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {t.handle}
                </p>
              </div>
            </motion.div>
          </AnimatedItem>
        ))}
      </div>
    </section>
  );
}


const INTEGRATIONS = ["Stripe", "Gumroad", "YouTube", "Twitter", "ConvertKit", "Ghost", "Substack", "Webflow"];

export function Integrations() {
  return (
    <section className="px-6 pb-24 md:px-12">
      <AnimatedWrapper variant="fadeUp" className="mb-16 text-center">
        <h2 className="font-display font-bold text-3xl md:text-4xl leading-normal" style={{
          fontSize: "clamp(1.75rem, 4vw, 3rem)",
          letterSpacing: "var(--tracking-tight)",
          color: "var(--text-primary)", lineHeight: "1.25"
        }}>Works with your stack </h2>
        <p className="mt-4 text-base" style={{ color: "var(--text-secondary)" }}>
          Aura plugs into the tools you already use, no migration needed.
        </p>
      </AnimatedWrapper>
      <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-4">
        {INTEGRATIONS.map((name) => (
          <span
            key={name}
            className="rounded-xl px-4 py-2 text-sm font-medium"
            style={{
              background: "rgba(var(--glass-bg-rgb) / 0.05)",
              border: "1px solid rgba(var(--glass-border-rgb) / 0.08)",
              color: "var(--text-secondary)",
            }}
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}

const FAQS = [
  { q: "Is there a free plan?", a: "Yes, you can start with a 14‑day free trial of the Pro plan. No credit card required." },
  { q: "How do you handle my data?", a: "Your data is stored in your own Supabase instance with row‑level security. We never see your raw data." },
  { q: "Can I cancel anytime?", a: "Absolutely. Cancel with one click and your data remains accessible for 30 days." },
  { q: "What platforms do you support?", a: "We currently support Stripe, Gumroad, YouTube, Twitter/X, newsletters (ConvertKit, Ghost, Substack), and manual CSV import." },
];

export function FAQ() {
  return (
    <section className="px-6 pb-24 md:px-12">
      <AnimatedWrapper variant="fadeUp" className="mb-16 text-center">
        <h2 className="font-display font-bold text-3xl md:text-4xl leading-normal" style={{
          fontSize: "clamp(1.75rem, 4vw, 3rem)",
          letterSpacing: "var(--tracking-tight)",
          color: "var(--text-primary)", lineHeight: "1.25"
        }}>          Frequently asked questions
        </h2>
      </AnimatedWrapper>
      <div className="mx-auto max-w-2xl divide-y divide-white/5">
        {FAQS.map((faq, i) => (
          <AnimatedItem key={i} variant="fadeUp">
            <div className="py-5">
              <h3 className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                {faq.q}
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                {faq.a}
              </p>
            </div>
          </AnimatedItem>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-12 md:px-12">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-4">
        <div>
          <h4 className="font-display font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Product</h4>
          <ul className="space-y-2 text-sm" style={{ color: "var(--text-muted)" }}>
            <li><Link href="/features">Features</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/login">Sign in</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Company</h4>
          <ul className="space-y-2 text-sm" style={{ color: "var(--text-muted)" }}>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/careers">Careers</Link></li>
            <li><Link href="/press">Press</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Support</h4>
          <ul className="space-y-2 text-sm" style={{ color: "var(--text-muted)" }}>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/docs">Documentation</Link></li>
            <li><Link href="/status">System status</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Legal</h4>
          <ul className="space-y-2 text-sm" style={{ color: "var(--text-muted)" }}>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Service</Link></li>
            <li><Link href="/cookies">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="mt-12 text-center text-xs" style={{ color: "#00f5ff" }}>
        © {new Date().getFullYear()} Aura by Earl Morningstar. All rights reserved.
      </div>
    </footer>
  );
}