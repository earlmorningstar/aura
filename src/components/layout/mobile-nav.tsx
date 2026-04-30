"use client";

/**
 * MobileNav — bottom tab bar for mobile viewports.
 *
 * Features:
 * - Next.js `<Link>` (no full-page reloads)
 * - Animated active indicator dot + icon scale via Framer Motion
 * - Spring tap feedback on each item
 * - Safe-area padding for iOS home bar (env(safe-area-inset-bottom))
 * - Labels below icons (accessibility + clarity)
 * - All glassmorphism properties applied
 * - Hidden on lg+ (sidebar takes over)
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  FileText,
  Sparkles,
} from "lucide-react";

/* ─── Nav items ──────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: TrendingUp, label: "Revenue", href: "/revenue" },
  { icon: Users, label: "Audience", href: "/audience" },
  { icon: FileText, label: "Content", href: "/content" },
  { icon: Sparkles, label: "Insights", href: "/insights" },
] as const;

/* ─── Tab item ───────────────────────────────────────────────────── */

interface TabItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive: boolean;
}

function TabItem({ icon: Icon, label, href, isActive }: TabItemProps) {
  return (
    <motion.div
      whileTap={{
        scale: 0.85,
        transition: { type: "spring", stiffness: 700, damping: 28, mass: 0.4 },
      }}
      className="flex-1"
    >
      <Link
        href={href}
        className="relative flex flex-col items-center gap-1 py-2 outline-none focus-visible:ring-2 focus-visible:ring-aura-cyan/60 focus-visible:ring-offset-0 rounded-xl"
        aria-current={isActive ? "page" : undefined}
        aria-label={label}
      >
        {/* Active background pill — shared layoutId slides across tabs */}
        {isActive && (
          <motion.span
            layoutId="mobile-nav-active-bg"
            className="absolute inset-x-1 inset-y-0 rounded-xl"
            style={{
              background: "rgba(var(--glass-bg-rgb) / 0.1)",
              border: "1px solid rgba(var(--glass-border-rgb) / 0.1)",
            }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}

        {/* Icon */}
        <motion.span
          className="relative z-10 flex h-6 w-6 items-center justify-center"
          animate={{
            color: isActive ? "var(--accent-cyan)" : "var(--text-tertiary)",
            scale: isActive ? 1.1 : 1,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
          aria-hidden
        >
          <Icon size={20} strokeWidth={isActive ? 2.25 : 1.75} />
        </motion.span>

        {/* Label */}
        <motion.span
          className="relative z-10 text-[10px] font-medium leading-none"
          animate={{
            color: isActive ? "var(--text-primary)" : "var(--text-muted)",
          }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.span>

        {/* Active dot */}
        <AnimatePresence>
          {isActive && (
            <motion.span
              className="absolute -top-0.5 left-1/2 -translate-x-1/2 rounded-full"
              style={{
                width: 16,
                height: 2,
                background: "var(--gradient-brand)",
                boxShadow: "var(--glow-cyan)",
              }}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
            />
          )}
        </AnimatePresence>
      </Link>
    </motion.div>
  );
}

/* ─── MobileNav ──────────────────────────────────────────────────── */

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[var(--z-sticky)] lg:hidden"
      aria-label="Mobile navigation"
      style={{
        // All four glassmorphism properties
        background: "rgba(var(--glass-bg-rgb) / var(--glass-opacity-3))",
        backdropFilter: "blur(var(--glass-blur-xl)) saturate(200%)",
        WebkitBackdropFilter: "blur(var(--glass-blur-xl)) saturate(200%)",
        borderTop: "1px solid rgba(var(--glass-border-rgb) / var(--glass-border-opacity))",
        boxShadow: "0 -8px 32px -4px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
        // iOS safe area support — keeps tabs above the home indicator
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-stretch px-2 pt-1">
        {NAV_ITEMS.map((item) => (
          <TabItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={pathname === item.href}
          />
        ))}
      </div>
    </nav>
  );
}