// "use client";

// import { motion } from "framer-motion";
// import { ReactNode } from "react";

// export function AnimatedWrapper({ children }: { children: ReactNode }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.6 }}
//     >
//       {children}
//     </motion.div>
//   );
// }


"use client";

/**
 * AnimatedWrapper — motion primitive collection for Aura.
 *
 * All animations use Framer Motion spring physics.
 * No duration-based easing (cubic-bezier) for primary motion —
 * spring physics gives physically plausible, interruptible animations.
 *
 * Exports:
 *   AnimatedWrapper     — single element entrance (fade/slide/scale)
 *   AnimatedGroup       — stagger container for child elements
 *   AnimatedItem        — stagger child (must be inside AnimatedGroup)
 *   AnimatedPage        — full page transition wrapper
 *   AnimatedPresence    — re-exports AnimatePresence for exit animations
 *   useReducedMotion    — hook to respect prefers-reduced-motion
 */

import * as React from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion as useFramerReducedMotion,
  type HTMLMotionProps,
  type Variants,
  type Target,
  type TargetAndTransition,
} from "framer-motion";
import { cn } from "@/lib/utils";

/* ─── Re-export AnimatePresence ──────────────────────────────────── */
export { AnimatePresence };

/* ─── Reduced motion hook ────────────────────────────────────────── */
/**
 * Returns true if the user has requested reduced motion.
 * Use this to conditionally skip animations.
 */
export function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false;
}

/* ─── Spring presets ─────────────────────────────────────────────── */

const springs = {
  /** Responsive, snappy — for UI elements */
  snappy: { type: "spring", stiffness: 400, damping: 28, mass: 0.6 } as const,
  /** Smooth, weighted — for page sections */
  smooth: { type: "spring", stiffness: 280, damping: 26, mass: 0.8 } as const,
  /** Bouncy — for decorative elements, icons */
  bouncy: { type: "spring", stiffness: 500, damping: 20, mass: 0.5 } as const,
  /** Gentle — for subtle fades, tooltips */
  gentle: { type: "spring", stiffness: 200, damping: 24, mass: 1.0 } as const,
} as const;

/* ─── Variant presets ────────────────────────────────────────────── */

type AnimationVariant =
  | "fadeIn"
  | "fadeUp"
  | "fadeDown"
  | "fadeLeft"
  | "fadeRight"
  | "scaleIn"
  | "scaleUp"
  | "slideLeft"
  | "slideRight"
  | "none";

function buildVariants(
  variant: AnimationVariant,
  springPreset: keyof typeof springs,
  delay: number,
  distance: number,
  reducedMotion: boolean,
): Variants {
  // When reduced motion is requested, only fade (no movement)
  if (reducedMotion) {
    return {
      hidden:  { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.2, delay } },
      exit:    { opacity: 0, transition: { duration: 0.15 } },
    };
  }

  const spring = { ...springs[springPreset], delay } as TargetAndTransition["transition"];

  const hiddenMap: Record<AnimationVariant, Target> = {
    fadeIn:     { opacity: 0 },
    fadeUp:     { opacity: 0, y: distance },
    fadeDown:   { opacity: 0, y: -distance },
    fadeLeft:   { opacity: 0, x: distance },
    fadeRight:  { opacity: 0, x: -distance },
    scaleIn:    { opacity: 0, scale: 0.9 },
    scaleUp:    { opacity: 0, scale: 0.85, y: distance * 0.5 },
    slideLeft:  { opacity: 0, x: distance * 1.5 },
    slideRight: { opacity: 0, x: -distance * 1.5 },
    none:       {},
  };

  return {
    hidden:  hiddenMap[variant],
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: spring,
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };
}

/* ─── AnimatedWrapper ────────────────────────────────────────────── */

export interface AnimatedWrapperProps extends HTMLMotionProps<"div"> {
  /** Animation entrance style. Default: "fadeUp" */
  variant?: AnimationVariant;
  /** Spring preset. Default: "smooth" */
  spring?: keyof typeof springs;
  /** Delay in seconds. Default: 0 */
  delay?: number;
  /** Translation distance in px. Default: 16 */
  distance?: number;
  /**
   * Trigger on scroll into viewport instead of mount.
   * Default: false (triggers on mount)
   */
  triggerOnViewport?: boolean;
  /** Viewport margin for scroll-triggered (default: "-10% 0px") */
  viewportMargin?: string;
  /** Only animate once on viewport entry. Default: true */
  once?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/**
 * AnimatedWrapper — entrance animation for a single element.
 *
 * @example Fade up on mount
 * <AnimatedWrapper variant="fadeUp" delay={0.1}>
 *   <SomeComponent />
 * </AnimatedWrapper>
 *
 * @example Scroll-triggered scale
 * <AnimatedWrapper variant="scaleIn" viewport>
 *   <Card />
 * </AnimatedWrapper>
 *
 * @example No animation (reduced motion safe)
 * <AnimatedWrapper variant="none">…</AnimatedWrapper>
 */
export function AnimatedWrapper({
  variant = "fadeUp",
  spring = "smooth",
  delay = 0,
  distance = 16,
  triggerOnViewport = false,
  viewportMargin = "-10% 0px",
  once = true,
  children,
  className,
  ...motionProps
}: AnimatedWrapperProps) {
  const reducedMotion = useReducedMotion();
  const variants = buildVariants(variant, spring, delay, distance, reducedMotion);

  const viewportConfig = triggerOnViewport
    ? { once, margin: viewportMargin }
    : undefined;

  return (
    <motion.div
      className={cn(className)}
      variants={variants}
      initial="hidden"
      animate={triggerOnViewport ? undefined : "visible"}
      whileInView={triggerOnViewport ? "visible" : undefined}
      exit="exit"
      viewport={viewportConfig}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}

/* ─── AnimatedGroup (stagger container) ──────────────────────────── */

export interface AnimatedGroupProps {
  /** Delay between each child in seconds. Default: 0.07 */
  stagger?: number;
  /** Delay before first child appears. Default: 0 */
  delayChildren?: number;
  children?: React.ReactNode;
  className?: string;
  /** HTML element type. Default: "div" */
  as?: React.ElementType;
}

/**
 * AnimatedGroup — orchestrates staggered child entrance.
 * Wrap around a list of AnimatedItem components.
 *
 * @example
 * <AnimatedGroup stagger={0.08}>
 *   {items.map(item => (
 *     <AnimatedItem key={item.id}>
 *       <Card data={item} />
 *     </AnimatedItem>
 *   ))}
 * </AnimatedGroup>
 */
export function AnimatedGroup({
  stagger = 0.07,
  delayChildren = 0,
  children,
  className,
  as: Tag = "div",
}: AnimatedGroupProps) {
  const reducedMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reducedMotion ? 0 : stagger,
        delayChildren: reducedMotion ? 0 : delayChildren,
      },
    },
  };

  const MotionTag = motion[Tag as keyof typeof motion] as typeof motion.div;

  return (
    <MotionTag
      className={cn(className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </MotionTag>
  );
}

/* ─── AnimatedItem (stagger child) ──────────────────────────────── */

export interface AnimatedItemProps {
  /** Animation style for this child. Default: "fadeUp" */
  variant?: AnimationVariant;
  /** Distance in px. Default: 12 */
  distance?: number;
  children?: React.ReactNode;
  className?: string;
}

/**
 * AnimatedItem — individual item inside an AnimatedGroup.
 * Inherits timing from the parent's stagger configuration.
 *
 * @example See AnimatedGroup example above.
 */
export function AnimatedItem({
  variant = "fadeUp",
  distance = 12,
  children,
  className,
}: AnimatedItemProps) {
  const reducedMotion = useReducedMotion();

  const itemVariants: Variants = reducedMotion
    ? {
        hidden:  { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.15 } },
      }
    : {
        hidden: {
          opacity: 0,
          y: variant === "fadeUp" ? distance
            : variant === "fadeDown" ? -distance
            : 0,
          x: variant === "fadeLeft"  ? distance
            : variant === "fadeRight" ? -distance
            : 0,
          scale: variant === "scaleIn" || variant === "scaleUp" ? 0.92 : 1,
        },
        visible: {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 320,
            damping: 26,
            mass: 0.7,
          },
        },
      };

  return (
    <motion.div className={cn(className)} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

/* ─── AnimatedPage ───────────────────────────────────────────────── */

export interface AnimatedPageProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * AnimatedPage — wraps a Next.js page for route transition animations.
 * Place in the app/layout.tsx around {children} or at the top of each page.
 *
 * @example In a page component
 * export default function DashboardPage() {
 *   return (
 *     <AnimatedPage>
 *       <DashboardContent />
 *     </AnimatedPage>
 *   );
 * }
 */
export function AnimatedPage({ children, className }: AnimatedPageProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.main
      className={cn("min-h-screen", className)}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
      transition={
        reducedMotion
          ? { duration: 0.2 }
          : { type: "spring", stiffness: 280, damping: 28, mass: 0.8 }
      }
    >
      {children}
    </motion.main>
  );
}

/* ─── AnimatedNumber ─────────────────────────────────────────────── */

export interface AnimatedNumberProps {
  /** Target value to count to */
  value: number;
  /** Decimal places. Default: 0 */
  decimals?: number;
  /** Prefix (e.g. "$"). Default: "" */
  prefix?: string;
  /** Suffix (e.g. "%"). Default: "" */
  suffix?: string;
  /** Animation delay in seconds. Default: 0 */
  delay?: number;
  className?: string;
}

/**
 * AnimatedNumber — standalone animated counter.
 * Extracted from GlassKPI so it can be used anywhere.
 *
 * @example
 * <AnimatedNumber value={12450} prefix="$" />
 */
export function AnimatedNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  delay = 0,
  className,
}: AnimatedNumberProps) {
  const [display, setDisplay] = React.useState(0);
  const reducedMotion = useReducedMotion();

  React.useEffect(() => {
    if (reducedMotion) {
      setDisplay(value);
      return;
    }

    let startTime: number | null = null;
    const duration = 1400; // ms

    function step(timestamp: number) {
      if (!startTime) startTime = timestamp + delay * 1000;
      const elapsed = Math.max(0, timestamp - startTime);
      const progress = Math.min(elapsed / duration, 1);
      // out-expo easing
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(eased * value);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    const frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, delay, reducedMotion]);

  const formatted =
    decimals > 0
      ? display.toFixed(decimals)
      : Math.round(display).toLocaleString();

  return (
    <span className={cn(className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}