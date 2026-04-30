// import { cn } from "@/lib/utils";

// interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
//   children: React.ReactNode;
// }

// export function GlassCard({ className, children, ...props }: GlassCardProps) {
//   return (
//     <div
//       className={cn("glass rounded-3xl p-6 glass-hover", className)}
//       {...props}
//     >
//       {children}
//     </div>
//   );
// }


"use client";

/**
 * GlassCard — core surface primitive for Aura.
 *
 * All four glassmorphism properties are always present:
 *   1. background  — semi-transparent fill
 *   2. backdrop-filter — blur + saturate behind the card
 *   3. border      — bright 1px edge highlight
 *   4. box-shadow  — layered depth + inner top-highlight
 *
 * Variants map to the `.glass-*` utility classes defined in globals.css.
 * Interactive variants use Framer Motion spring physics — never CSS transforms.
 */

import * as React from "react";
import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ─── CVA variant map ─────────────────────────────────────────────── */
const cardVariants = cva(
  // Base — always present
  "relative overflow-hidden rounded-2xl",
  {
    variants: {
      /**
       * visual — controls the glass depth / tint level.
       *   subtle     → whisper-thin background, lightest borders
       *   default    → standard dashboard card
       *   prominent  → modal panels, hero cards
       *   cyan       → accent-tinted; KPI highlights, success states
       *   purple     → accent-tinted; feature callouts
       */
      visual: {
        subtle:    "glass-subtle",
        default:   "glass",
        prominent: "glass-prominent",
        cyan:      "glass-cyan",
        purple:    "glass-purple",
      },
      /**
       * padding — card content inset.
       *   none → 0 (for cards that manage their own padding, e.g. charts)
       *   sm   → tight; compact list items
       *   md   → standard
       *   lg   → hero / feature cards
       */
      padding: {
        none: "p-0",
        sm:   "p-4",
        md:   "p-6",
        lg:   "p-8",
      },
      /** interactive — enables hover/press spring animations */
      interactive: {
        true:  "cursor-pointer select-none",
        false: "",
      },
    },
    defaultVariants: {
      visual:      "default",
      padding:     "md",
      interactive: false,
    },
  },
);

/* ─── Framer Motion variants ──────────────────────────────────────── */

/** Entry animation — stagger-friendly; parent should pass custom `delay` */
const cardEnterVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 28,
      mass: 0.8,
    },
  },
};

/** Hover / press spring for interactive cards */
const cardHoverVariants: Variants = {
  rest: {
    y: 0,
    scale: 1,
    boxShadow:
      "0 8px 32px -4px rgba(0,0,0,0.4), 0 2px 8px -2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  hover: {
    y: -3,
    scale: 1.005,
    boxShadow:
      "0 20px 56px -8px rgba(0,0,0,0.5), 0 8px 16px -4px rgba(0,245,255,0.08), inset 0 1px 0 rgba(255,255,255,0.10)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
      mass: 0.6,
    },
  },
  tap: {
    y: 0,
    scale: 0.98,
    boxShadow:
      "0 4px 16px -4px rgba(0,0,0,0.4), inset 0 2px 4px rgba(0,0,0,0.2)",
    transition: {
      type: "spring",
      stiffness: 600,
      damping: 30,
    },
  },
};

/* ─── Types ───────────────────────────────────────────────────────── */

interface GlassCardBaseProps
  extends VariantProps<typeof cardVariants> {
  /** Delay the entrance animation (seconds). Useful for staggered grids. */
  delay?: number;
  /** When true the card plays an entrance animation. Default: false */
  animate?: boolean;
  /** Extra class names merged via cn() */
  className?: string;
  children?: React.ReactNode;
}

/**
 * When interactive=true we expose motion div props (whileHover etc.).
 * When interactive=false we expose standard HTML div props.
 * Union forces consumers to pick the right prop set.
 */
type GlassCardProps =
  | (GlassCardBaseProps & { interactive: true }  & Omit<HTMLMotionProps<"div">, keyof GlassCardBaseProps>)
  | (GlassCardBaseProps & { interactive?: false } & Omit<React.HTMLAttributes<HTMLDivElement>, keyof GlassCardBaseProps>);

/* ─── Component ───────────────────────────────────────────────────── */

/**
 * GlassCard
 *
 * @example Static card
 * <GlassCard visual="prominent" padding="lg">…</GlassCard>
 *
 * @example Interactive card with spring hover
 * <GlassCard interactive visual="cyan" onClick={handleClick}>…</GlassCard>
 *
 * @example Staggered grid entrance
 * <GlassCard animate delay={0.1}>…</GlassCard>
 */
const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  function GlassCard(
    {
      visual,
      padding,
      interactive,
      animate = false,
      delay = 0,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const combinedClassName = cn(
      cardVariants({ visual, padding, interactive }),
      className,
    );

    /* ── Interactive variant — full spring physics ──────────── */
    if (interactive) {
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onClick,
        ...motionRest
      } = rest as HTMLMotionProps<"div">;

      return (
        <motion.div
          ref={ref}
          className={combinedClassName}
          variants={cardHoverVariants}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
          animate={animate ? undefined : "rest"}
          onClick={(rest as HTMLMotionProps<"div">).onClick}
          {...motionRest}
        >
          {/* Top-edge shimmer line — adds glass "thickness" */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0.12) 60%, transparent 100%)",
            }}
          />
          {children}
        </motion.div>
      );
    }

    /* ── Static variant — with optional entrance animation ───── */
    if (animate) {
      return (
        <motion.div
          ref={ref}
          className={combinedClassName}
          variants={cardEnterVariants}
          initial="hidden"
          animate="visible"
          custom={delay}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 28,
            delay,
          }}
          {...(rest as HTMLMotionProps<"div">)}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0.12) 60%, transparent 100%)",
            }}
          />
          {children}
        </motion.div>
      );
    }

    /* ── Plain div — zero JS overhead for non-animated cards ─── */
    return (
      <div
        ref={ref}
        className={combinedClassName}
        {...(rest as React.HTMLAttributes<HTMLDivElement>)}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0.12) 60%, transparent 100%)",
          }}
        />
        {children}
      </div>
    );
  },
);

GlassCard.displayName = "GlassCard";

export { GlassCard, cardVariants };
export type { GlassCardProps };