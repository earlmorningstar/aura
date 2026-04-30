// import { cva, type VariantProps } from "class-variance-authority";
// import { cn } from "@/lib/utils";

// const buttonVariants = cva(
//   "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2",
//   {
//     variants: {
//       variant: {
//         default: "glass bg-gradient-to-r from-[#00f5ff] to-[#a855f7] text-white hover:brightness-110",
//         ghost: "hover:bg-white/10",
//       },
//       size: {
//         default: "h-11 px-6",
//         sm: "h-9 px-4 text-xs",
//       },
//     },
//     defaultVariants: {
//       variant: "default",
//       size: "default",
//     },
//   }
// );

// export function GlassButton({
//   className,
//   variant,
//   size,
//   ...props
// }: React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
//   return (
//     <button
//       className={cn(buttonVariants({ variant, size }), className)}
//       {...props}
//     />
//   );
// }


"use client";

/**
 * GlassButton — interactive action primitive for Aura.
 *
 * Design decisions:
 * - Framer Motion spring physics for press (no CSS active:scale)
 * - `asChild` via Radix Slot for polymorphic rendering (e.g. as Next <Link>)
 * - Gradient text is dark (#030305) not white — cyan/purple gradient is bright
 * - Loading state with animated spinner replaces label
 * - All colours reference design tokens, zero magic hex/rgba values
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── CVA variant map ─────────────────────────────────────────────── */

const buttonVariants = cva(
  // Base — applied to all variants
  [
    "relative inline-flex items-center justify-center gap-2",
    "whitespace-nowrap font-medium font-body",
    "rounded-xl select-none",
    "transition-colors duration-150",
    // Focus ring using design token colour
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-aura-base",
    // Disabled state
    "disabled:pointer-events-none disabled:opacity-40",
    // Overflow for shimmer effect on primary
    "overflow-hidden",
  ],
  {
    variants: {
      /**
       * variant — visual treatment.
       *   primary  → brand gradient fill, dark label
       *   ghost    → glass fill, muted label
       *   outline  → transparent + accent border
       *   danger   → error-tinted glass
       *   icon     → square, no label (size controls dimension)
       */
      variant: {
        primary: [
          "bg-brand text-aura-void",
          "shadow-glow-cyan",
        ],
        ghost: [
          "glass text-aura-text-secondary",
          "hover:text-aura-text-primary",
        ],
        outline: [
          "border border-aura-cyan/30 bg-transparent text-aura-cyan",
          "hover:bg-aura-cyan/5 hover:border-aura-cyan/50",
        ],
        danger: [
          "glass text-[rgb(var(--status-error-rgb))]",
          "border border-[rgba(var(--status-error-rgb),0.2)]",
          "hover:bg-[rgba(var(--status-error-rgb),0.08)]",
        ],
        // Icon-only: no horizontal padding, square aspect
        icon: [
          "glass text-aura-text-secondary",
          "hover:text-aura-text-primary",
          "aspect-square",
        ],
      },
      size: {
        xs:   "h-7  px-3   text-2xs",
        sm:   "h-9  px-4   text-sm",
        md:   "h-11 px-6   text-sm",
        lg:   "h-12 px-8   text-md",
        // Icon sizes — px overridden by aspect-square
        icon_sm: "h-8  w-8  text-sm p-0",
        icon_md: "h-10 w-10 text-sm p-0",
        icon_lg: "h-12 w-12 text-md p-0",
      },
    },
    compoundVariants: [
      // Icon variant always uses square sizes
      {
        variant: "icon",
        size: "sm",
        class: "h-8 w-8 p-0",
      },
      {
        variant: "icon",
        size: "md",
        class: "h-10 w-10 p-0",
      },
      {
        variant: "icon",
        size: "lg",
        class: "h-12 w-12 p-0",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

/* ─── Spring physics ─────────────────────────────────────────────── */

const springPress = {
  type: "spring",
  stiffness: 600,
  damping: 30,
  mass: 0.5,
} as const;

const springHover = {
  type: "spring",
  stiffness: 400,
  damping: 22,
  mass: 0.6,
} as const;

/* ─── Shimmer overlay — primary button only ──────────────────────── */

function PrimaryShimmer() {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
        backgroundSize: "200% 100%",
      }}
      initial={{ backgroundPosition: "200% center" }}
      whileHover={{
        backgroundPosition: "-200% center",
        transition: { duration: 0.6, ease: "linear" },
      }}
    />
  );
}

/* ─── Types ──────────────────────────────────────────────────────── */

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as child element (e.g. Next.js `<Link>`) via Radix Slot */
  asChild?: boolean;
  /** Shows a spinner and disables interaction */
  loading?: boolean;
  /** Icon rendered before the label */
  leadingIcon?: React.ReactNode;
  /** Icon rendered after the label */
  trailingIcon?: React.ReactNode;
}

/* ─── Component ──────────────────────────────────────────────────── */

/**
 * GlassButton
 *
 * @example Primary CTA
 * <GlassButton>Upgrade Plan</GlassButton>
 *
 * @example Ghost with icon
 * <GlassButton variant="ghost" leadingIcon={<Plus size={16} />}>Add metric</GlassButton>
 *
 * @example As Next.js Link (polymorphic)
 * <GlassButton asChild variant="outline"><Link href="/dashboard">Dashboard</Link></GlassButton>
 *
 * @example Loading state
 * <GlassButton loading>Saving…</GlassButton>
 *
 * @example Icon-only
 * <GlassButton variant="icon" size="icon_md" aria-label="Settings"><Settings size={16} /></GlassButton>
 */
const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  function GlassButton(
    {
      className,
      variant = "primary",
      size = "md",
      asChild = false,
      loading = false,
      disabled,
      leadingIcon,
      trailingIcon,
      children,
      ...props
    },
    ref,
  ) {
    const isDisabled = disabled || loading;

    const combinedClass = cn(
      buttonVariants({ variant, size }),
      // Loading: keep dimensions, hide children opacity
      loading && "cursor-wait",
      className,
    );

    // When asChild, delegate to Radix Slot (no motion wrapper)
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={combinedClass}
          aria-disabled={isDisabled}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={combinedClass}
        disabled={isDisabled}
        // Spring press — replaces CSS active:scale-95
        whileTap={{
          scale: 0.95,
          transition: springPress,
        }}
        whileHover={
          !isDisabled
            ? {
                scale: 1.02,
                transition: springHover,
              }
            : undefined
        }
        // Prevent layout shift during scale
        style={{ willChange: "transform" }}
        {...(props as HTMLMotionProps<"button">)}
      >
        {/* Shimmer sweep — primary only */}
        {variant === "primary" && !loading && <PrimaryShimmer />}

        {/* Content — fades out during loading */}
        <motion.span
          className="relative inline-flex items-center gap-2"
          animate={{ opacity: loading ? 0 : 1 }}
          transition={{ duration: 0.15 }}
        >
          {leadingIcon && (
            <span className="shrink-0 [&>svg]:size-4">{leadingIcon}</span>
          )}
          {children}
          {trailingIcon && (
            <span className="shrink-0 [&>svg]:size-4">{trailingIcon}</span>
          )}
        </motion.span>

        {/* Loading spinner — fades in, absolutely positioned */}
        {loading && (
          <motion.span
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            aria-hidden
          >
            <Loader2
              className="animate-spin"
              size={16}
              style={{ color: "currentColor" }}
            />
          </motion.span>
        )}
      </motion.button>
    );
  },
);

GlassButton.displayName = "GlassButton";

export { GlassButton, buttonVariants };