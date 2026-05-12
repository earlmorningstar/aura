"use client";

/**
 * Sidebar — primary navigation for Aura desktop layout.
 *
 * Features:
 * - Framer Motion `layoutId` pill that slides between active nav items
 * - Next.js `<Link>` (no full-page reloads)
 * - Workspace switcher with glassmorphic custom dropdown
 * - Logo with animated gradient shimmer on hover
 * - Spring physics on all interactions
 * - Keyboard accessible — correct aria roles
 * - All colours from design tokens
 */

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  FileText,
  Sparkles,
  Plus,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { WorkspaceActions } from "@/components/workspace/workspace-actions";
import { GlassButton } from "@/components/ui/glass-button";
import { useNewWorkspaceModalStore } from "@/stores/new-workspace-modal-store";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

/* ─── Nav items ──────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: TrendingUp, label: "Revenue", href: "/revenue" },
  { icon: Users, label: "Audience", href: "/audience" },
  { icon: FileText, label: "Content", href: "/content" },
  { icon: Sparkles, label: "Insights", href: "/insights" },
] as const;

/* ─── Workspace Switcher ─────────────────────────────────────────── */

interface WorkspaceSwitcherProps {
  workspaces: Array<{ slug: string; name: string }>;
  current: string;
  onSelect: (slug: string) => void;
}

function WorkspaceSwitcher({
  workspaces,
  current,
  onSelect,
}: WorkspaceSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const currentWs = workspaces.find((w) => w.slug === current);
  const ref = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative px-3">
      <motion.button
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5",
          "border transition-colors duration-150",
          "text-left text-sm font-medium",
        )}
        style={{
          background: "rgba(var(--glass-bg-rgb) / 0.06)",
          borderColor: "rgba(var(--glass-border-rgb) / var(--glass-border-opacity))",
          color: "var(--text-primary)",
        }}
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.98, transition: { type: "spring", stiffness: 600, damping: 30 } }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {/* Workspace avatar */}
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold"
          style={{ background: "var(--gradient-brand)", color: "var(--color-bg-void)" }}
          aria-hidden
        >
          {(currentWs?.name ?? "W")[0]}
        </span>
        <span className="flex-1 truncate">{currentWs?.name ?? "Select workspace"}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          aria-hidden
        >
          <ChevronDown size={14} style={{ color: "var(--text-tertiary)" }} />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Select workspace"
            className="absolute left-3 right-3 top-full z-[var(--z-dropdown)] mt-1 overflow-hidden rounded-xl py-1"
            style={{
              background: "rgba(10,10,18,0.92)",
              backdropFilter: "blur(var(--glass-blur-lg)) saturate(180%)",
              WebkitBackdropFilter: "blur(var(--glass-blur-lg)) saturate(180%)",
              border: "1px solid rgba(var(--glass-border-rgb) / var(--glass-border-opacity-strong))",
              boxShadow: "var(--shadow-lg)",
            }}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          >
            {workspaces.map((ws) => (
              <li key={ws.slug} role="option" aria-selected={ws.slug === current} className="flex items-center justify-between pr-2">
                <motion.button
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm"
                  style={{
                    color: ws.slug === current ? "var(--text-primary)" : "var(--text-secondary)",
                    background: ws.slug === current
                      ? "rgba(var(--glass-bg-rgb) / 0.1)"
                      : "transparent",
                  }}
                  whileHover={{
                    background: "rgba(var(--glass-bg-rgb) / 0.08)",
                    color: "var(--text-primary)",
                  }}
                  onClick={() => { onSelect(ws.slug); setOpen(false); }}
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold"
                    style={{ background: "var(--gradient-brand)", color: "var(--color-bg-void)" }}
                    aria-hidden
                  >
                    {ws.name[0]}
                  </span>
                  {ws.name}
                </motion.button>
                <WorkspaceActions workspace={ws} onClose={() => setOpen(false)} />
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Nav item ───────────────────────────────────────────────────── */

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive: boolean;
}

function NavItem({ icon: Icon, label, href, isActive }: NavItemProps) {
  return (
    <li>
      <Link
        href={href}
        prefetch={true}
        className={cn(
          "relative flex items-center gap-3 rounded-xl py-2.5 pl-3 pr-3 text-sm font-medium outline-none",
          "transition-all duration-200 ease-out",
          "focus-visible:ring-2 focus-visible:ring-aura-cyan/60",
        )}
        style={{
          background: isActive
            ? "rgba(var(--glass-bg-rgb) / 0.1)"
            : "transparent",
          // 3px left border, only visible when active
          borderLeftWidth: isActive ? "3px" : "0px",
          borderLeftColor: isActive ? "var(--accent-cyan)" : "transparent",
          borderLeftStyle: "solid",
          // Compensate padding so the text doesn't shift
          paddingLeft: isActive ? "calc(0.75rem - 3px)" : "0.75rem",
        }}
        aria-current={isActive ? "page" : undefined}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "rgba(var(--glass-bg-rgb) / 0.04)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "transparent";
          }
        }}
      >
        {/* Icon */}
        <motion.span
          className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center"
          animate={{
            color: isActive ? "var(--accent-cyan)" : "var(--text-tertiary)",
          }}
          transition={{ duration: 0.2 }}
        >
          <Icon size={17} strokeWidth={isActive ? 2 : 1.75} />
        </motion.span>

        {/* Label */}
        <motion.span
          className="relative z-10"
          animate={{
            color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
          }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.span>
      </Link>
    </li>
  );
}

/* ─── Footer user section ────────────────────────────────────────── */

function SidebarFooter() {
  return (
    <div
      className="flex items-center gap-3 px-3 py-4"
      style={{ borderTop: "1px solid rgba(var(--glass-border-rgb) / 0.08)" }}
    >

      {/* Settings */}
      <motion.div
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 500, damping: 22 }}
      >
        <Link
          href="/settings"
          className="flex h-8 w-8 items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-aura-cyan/60"
          style={{
            background: "rgba(var(--glass-bg-rgb) / 0.06)",
            border: "1px solid rgba(var(--glass-border-rgb) / 0.08)",
            color: "var(--text-tertiary)",
          }}
          aria-label="Settings"
        >
          <Settings size={15} />
        </Link>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/login";
        }}
        className="flex h-8 w-8 items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-aura-cyan/60"
        style={{
          background: "rgba(var(--glass-bg-rgb) / 0.06)",
          border: "1px solid rgba(var(--glass-border-rgb) / 0.08)",
          color: "var(--text-tertiary)",
        }}
        aria-label="Sign out"
      >
        <LogOut size={15} />
      </motion.button>
    </div>
  );
}

/* ─── Sidebar ────────────────────────────────────────────────────── */

export function Sidebar() {
  const pathname = usePathname();
  const { currentWorkspace, setWorkspace } = useWorkspaceStore();
  const { data: workspaces = [] } = useWorkspaces();

  return (
    <motion.aside
      className="fixed bottom-6 left-6 top-6 hidden w-[var(--sidebar-width)] flex-col lg:flex"
      style={{
        //Four glassmorphism properties
        background: "rgba(var(--glass-bg-rgb) / var(--glass-opacity-2))",
        backdropFilter: "blur(var(--glass-blur-lg)) saturate(180%)",
        WebkitBackdropFilter: "blur(var(--glass-blur-lg)) saturate(180%)",
        border: "1px solid rgba(var(--glass-border-rgb) / var(--glass-border-opacity))",
        boxShadow:
          "0 8px 32px -4px rgba(0,0,0,0.4), 0 2px 8px -2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
        borderRadius: "var(--radius-2xl)",
      }}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 26, mass: 0.8 }}
    >
      {/* ── Logo ──────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-5 pb-5 pt-6"
        style={{ borderBottom: "1px solid rgba(var(--glass-border-rgb) / 0.08)" }}
      >
        {/* Logo mark */}
        <motion.div
          className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "var(--gradient-brand)" }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          aria-hidden
        >
          {/* Inner sparkle */}
          <span className="text-[10px] font-black" style={{ color: "var(--color-bg-void)" }}>
            A
          </span>
        </motion.div>

        {/* Wordmark */}
        <span
          className="font-display text-xl font-bold"
          style={{
            letterSpacing: "var(--tracking-tight)",
            color: "var(--text-primary)",
          }}
        >
          aura
        </span>
      </div>

      {/* ── Workspace switcher ─────────────────────────────────── */}
      <div
        className="py-3"
        style={{ borderBottom: "1px solid rgba(var(--glass-border-rgb) / 0.08)" }}
      >
        <WorkspaceSwitcher
          workspaces={workspaces}
          current={currentWorkspace}
          onSelect={setWorkspace}
        />
      </div>

      {/* ── Navigation ────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        <ul className="flex flex-col gap-1.5" role="list">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={pathname === item.href}
            />
          ))}
        </ul>
      </nav>

      {/* ── New workspace CTA ──────────────────────────────────── */}
      <div className="px-3 pb-2">
        <GlassButton
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          leadingIcon={<Plus size={14} />}
          onClick={() => useNewWorkspaceModalStore.getState().open()}
        >
          New Workspace
        </GlassButton>
      </div>

      {/* ── Footer ────────────────────────────────────────────── */}
      <SidebarFooter />
    </motion.aside>
  );
}