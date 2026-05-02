import type { Config } from "tailwindcss";

/**
 * Aura Tailwind Configuration
 *
 * Design philosophy:
 * - All colour/spacing tokens mirror design-tokens.css CSS custom properties
 * - Tailwind classes are the ergonomic API; CSS vars are the canonical source
 * - No magic numbers in component code — always reference a named token
 */
const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
  ],

  // Dark mode via class — ThemeProvider in layout.tsx sets it
  darkMode: "class",

  theme: {
    extend: {
      /* ─── Colours ─────────────────────────────────────────── */
      colors: {
        aura: {
          /* Backgrounds */
          void: "#030305",
          base: "#07070c",
          raised: "#0d0d14",
          overlay: "#12121c",

          /* Brand accents */
          cyan: "#00f5ff",
          "cyan-dim": "#00c8d4",
          purple: "#a855f7",
          "purple-dim": "#8b3fd4",
          pink: "#f0abfc",
          amber: "#fbbf24",

          /* Status */
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
          info: "#3b82f6",

          /* Text */
          "text-primary": "rgba(255,255,255,0.96)",
          "text-secondary": "rgba(255,255,255,0.65)",
          "text-tertiary": "rgba(255,255,255,0.40)",
          "text-muted": "rgba(255,255,255,0.24)",

          /* Borders */
          border: "rgba(255,255,255,0.08)",
          "border-strong": "rgba(255,255,255,0.14)",
        },
      },

      /* ─── Font families ───────────────────────────────────── */
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        // Fallback sans for system-level rendering
        sans: ["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },

      /* ─── Font sizes (fluid) ──────────────────────────────── */
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
        xs: ["0.75rem", { lineHeight: "1.25rem" }],
        sm: ["0.875rem", { lineHeight: "1.5rem" }],
        base: ["1rem", { lineHeight: "1.6rem" }],
        md: ["1.125rem", { lineHeight: "1.75rem" }],
        lg: ["1.25rem", { lineHeight: "1.75rem" }],
        xl: ["1.5rem", { lineHeight: "1.75rem" }],
        "2xl": ["2rem", { lineHeight: "1.25rem", letterSpacing: "-0.03em" }],
        "3xl": ["2.5rem", { lineHeight: "1.15rem", letterSpacing: "-0.04em" }],
        "4xl": ["3.5rem", { lineHeight: "1.05rem", letterSpacing: "-0.05em" }],
        "5xl": [
          "clamp(3rem,8vw,5rem)",
          { lineHeight: "1rem", letterSpacing: "-0.05em" },
        ],
      },

      /* ─── Letter spacing ──────────────────────────────────── */
      letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.04em",
        snug: "-0.02em",
        normal: "0em",
        wide: "0.06em",
        wider: "0.12em",
        caps: "0.14em",
      },

      /* ─── Spacing scale (extends default) ────────────────── */
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "17": "4.25rem",
        "18": "4.5rem",
        sidebar: "260px",
        "sidebar-sm": "72px",
        header: "64px",
      },

      /* ─── Border radius ───────────────────────────────────── */
      borderRadius: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "2.5rem",
      },

      /* ─── Backdrop blur levels ────────────────────────────── */
      backdropBlur: {
        xs: "2px",
        sm: "8px",
        DEFAULT: "12px",
        md: "24px",
        lg: "40px",
        xl: "64px",
        "2xl": "96px",
      },

      /* ─── Box shadows ─────────────────────────────────────── */
      boxShadow: {
        xs: "0 1px 2px rgb(0 0 0 / 0.4)",
        sm: "0 2px 8px rgb(0 0 0 / 0.4), 0 1px 2px rgb(0 0 0 / 0.3)",
        DEFAULT: "0 8px 24px rgb(0 0 0 / 0.35), 0 2px 6px rgb(0 0 0 / 0.25)",
        md: "0 8px 24px rgb(0 0 0 / 0.35), 0 2px 6px rgb(0 0 0 / 0.25)",
        lg: "0 16px 48px rgb(0 0 0 / 0.45), 0 4px 12px rgb(0 0 0 / 0.3)",
        xl: "0 24px 64px rgb(0 0 0 / 0.5), 0 8px 20px rgb(0 0 0 / 0.35)",
        "2xl": "0 32px 80px rgb(0 0 0 / 0.6), 0 12px 32px rgb(0 0 0 / 0.4)",
        glass:
          "0 8px 32px -4px rgb(0 0 0 / 0.4), 0 2px 8px -2px rgb(0 0 0 / 0.3), inset 0 1px 0 rgba(255 255 255 / 0.06)",
        "glow-cyan":
          "0 0 20px rgba(0 245 255 / 0.25), 0 0 60px rgba(0 245 255 / 0.10)",
        "glow-purple":
          "0 0 20px rgba(168 85 247 / 0.25), 0 0 60px rgba(168 85 247 / 0.10)",
        "glow-brand":
          "0 0 30px rgba(0 245 255 / 0.2), 0 0 80px rgba(168 85 247 / 0.15)",
        "inner-white": "inset 0 1px 0 rgba(255 255 255 / 0.06)",
        "inner-cyan": "inset 0 0 0 1px rgba(0 245 255 / 0.2)",
        none: "none",
      },

      /* ─── Background gradients ────────────────────────────── */
      backgroundImage: {
        brand: "linear-gradient(135deg, #00f5ff 0%, #a855f7 100%)",
        "brand-reverse": "linear-gradient(135deg, #a855f7 0%, #00f5ff 100%)",
        "brand-soft":
          "linear-gradient(135deg, rgba(0,245,255,0.15) 0%, rgba(168,85,247,0.15) 100%)",
        "brand-diagonal":
          "linear-gradient(45deg, #00f5ff 0%, #a855f7 50%, #f0abfc 100%)",
        "radial-cyan":
          "radial-gradient(ellipse at center, rgba(0,245,255,0.15) 0%, transparent 60%)",
        "radial-purple":
          "radial-gradient(ellipse at center, rgba(168,85,247,0.15) 0%, transparent 60%)",
        "radial-ambient":
          "radial-gradient(ellipse 100% 60% at 50% -10%, rgba(0,245,255,0.06), transparent 70%)",
        "fade-up":
          "linear-gradient(180deg, transparent 0%, rgba(7,7,12,0.9) 100%)",
        "fade-down":
          "linear-gradient(0deg, transparent 0%, rgba(7,7,12,0.9) 100%)",
        noise:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
        shimmer:
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
      },

      /* ─── Z-index scale ───────────────────────────────────── */
      zIndex: {
        "-1": "-1",
        "0": "0",
        "10": "10",
        "20": "20",
        "30": "30",
        "40": "40",
        "50": "50",
        dropdown: "100",
        sticky: "200",
        overlay: "300",
        modal: "400",
        toast: "500",
        tooltip: "600",
      },

      /* ─── Animations ──────────────────────────────────────── */
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-down": {
          from: { opacity: "0", transform: "translateY(-16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow:
              "0 0 12px rgba(0,245,255,0.2), 0 0 32px rgba(0,245,255,0.08)",
          },
          "50%": {
            boxShadow:
              "0 0 24px rgba(0,245,255,0.35), 0 0 64px rgba(0,245,255,0.15)",
          },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "count-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "skeleton-wave": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "border-rotate": {
          from: { "--border-angle": "0deg" } as Record<string, string>,
          to: { "--border-angle": "360deg" } as Record<string, string>,
        },
        "drift-1": {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "100%": { transform: "translate(40px, 30px) scale(1.08)" },
        },
        "drift-2": {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "100%": { transform: "translate(-30px, 20px) scale(1.06)" },
        },
        "drift-3": {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "100%": { transform: "translate(20px, -25px) scale(1.05)" },
        },
      },

      animation: {
        "fade-in": "fade-in     0.4s cubic-bezier(0.16,1,0.3,1) both",
        "fade-up": "fade-up     0.5s cubic-bezier(0.16,1,0.3,1) both",
        "fade-down": "fade-down   0.5s cubic-bezier(0.16,1,0.3,1) both",
        "scale-in": "scale-in    0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        "slide-left": "slide-in-left  0.5s cubic-bezier(0.16,1,0.3,1) both",
        "slide-right": "slide-in-right 0.5s cubic-bezier(0.16,1,0.3,1) both",
        float: "float       3s ease-in-out infinite",
        "pulse-glow": "pulse-glow  2.5s ease-in-out infinite",
        shimmer: "shimmer     2s linear infinite",
        "spin-slow": "spin-slow   8s linear infinite",
        "count-up": "count-up    0.4s cubic-bezier(0.16,1,0.3,1) both",
        skeleton: "skeleton-wave 1.8s ease-in-out infinite",
        "drift-1": "drift-1 18s ease-in-out infinite alternate",
        "drift-2": "drift-2 22s ease-in-out infinite alternate",
        "drift-3": "drift-3 16s ease-in-out infinite alternate",
      },

      /* ─── Transition timing functions ─────────────────────── */
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-expo": "cubic-bezier(0.7, 0, 0.84, 0)",
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },

      /* ─── Transition durations ────────────────────────────── */
      transitionDuration: {
        "80": "80ms",
        "150": "150ms",
        "250": "250ms",
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
        "1000": "1000ms",
      },

      /* ─── Max widths ──────────────────────────────────────── */
      maxWidth: {
        content: "1440px",
        panel: "480px",
        prose: "72ch",
      },

      /* ─── Min heights ─────────────────────────────────────── */
      minHeight: {
        screen: "100dvh",
      },

      /* ─── Grid template columns ───────────────────────────── */
      gridTemplateColumns: {
        dashboard: "260px 1fr",
        "dashboard-sm": "72px 1fr",
        "sidebar-main": "minmax(260px,300px) 1fr",
        "auto-sm": "repeat(auto-fill, minmax(min(100%,320px), 1fr))",
        "auto-md": "repeat(auto-fill, minmax(min(100%,400px), 1fr))",
      },
    },
  },

  plugins: [],
};

export default config;
