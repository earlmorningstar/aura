"use client";

/**
 * MobileQuickActions — floating button that opens a bottom sheet
 * containing the topbar and sidebar actions hidden on small screens.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Sparkles,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useUIStore } from "@/stores/ui-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useNewWorkspaceModalStore } from "@/stores/new-workspace-modal-store";
import { GlassButton } from "@/components/ui/glass-button";

export function MobileQuickActions() {
  const [open, setOpen] = React.useState(false);
  const toggleAIOpen = useUIStore((s) => s.toggleAIOpen);
  const { currentWorkspace, setWorkspace } = useWorkspaceStore();
  const { data: workspaces = [] } = useWorkspaces();

  const handleAskAI = () => {
    setOpen(false);
    toggleAIOpen();
  };

  return (
    <>
      {/* Floating action button */}
      <motion.button
        className="fixed bottom-20 right-4 z-[45] flex h-12 w-12 items-center justify-center rounded-2xl lg:hidden"
        style={{
          background: "var(--gradient-brand)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.92 }}
        aria-label="Quick actions"
      >
        {open ? (
          <X size={20} style={{ color: "var(--color-bg-void)" }} />
        ) : (
          <Plus size={24} style={{ color: "var(--color-bg-void)" }} />
        )}
      </motion.button>

      {/* Bottom sheet */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[44] bg-black/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-[46] mx-2 mb-20 max-h-[70vh] overflow-y-auto rounded-t-3xl p-6 lg:hidden"
              style={{
                background: "rgba(10,10,18,0.96)",
                backdropFilter: "blur(24px) saturate(180%)",
                border: "1px solid rgba(var(--glass-border-rgb) / 0.2)",
                borderBottom: "none",
                boxShadow: "var(--shadow-xl)",
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex flex-col gap-6">
                {/* Date range */}
                <div>
                  <p className="mb-2 text-xs font-semibold text-muted uppercase">Date range</p>
                  <DateRangePicker />
                </div>

                {/* Ask AI + Notifications */}
                <div className="flex items-center gap-3">
                  <GlassButton
                    variant="outline"
                    size="sm"
                    leadingIcon={<Sparkles size={13} />}
                    onClick={handleAskAI}
                    className="flex-1 border-aura-cyan/25"
                  >
                    Ask Aura AI
                  </GlassButton>
                  <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <Bell size={16} className="text-white/60" />
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gradient-brand text-[10px] font-bold text-black">
                      3
                    </span>
                  </button>
                </div>

                <div>
  <p className="mb-2 text-xs font-semibold text-muted uppercase">Account</p>
  <div className="flex items-center gap-3 rounded-xl px-2 py-2 bg-white/5 border border-white/5">
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
      style={{ background: "var(--gradient-brand)", color: "var(--color-bg-void)" }}
    >
      EC
    </div>
    <div>
      <p className="text-sm font-medium text-white">Earl Cameron</p>
      <p className="text-xs text-white/40">Pro plan</p>
    </div>
    <button className="ml-auto text-xs text-white/60 hover:text-white">
      <LogOut size={14} />
    </button>
  </div>
</div>

                {/* Workspace */}
                <div>
                  <p className="mb-2 text-xs font-semibold text-muted uppercase">Workspace</p>
                  <div className="flex flex-col gap-1.5">
                    {workspaces.map((ws) => (
                      <button
                        key={ws.slug}
                        className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium ${
                          ws.slug === currentWorkspace
                            ? "bg-white/10 text-white"
                            : "text-white/60 hover:bg-white/5"
                        }`}
                        onClick={() => {
                          setWorkspace(ws.slug);
                          setOpen(false);
                        }}
                      >
                        {ws.name}
                      </button>
                    ))}
                   <GlassButton
  variant="ghost"
  size="sm"
  className="w-full justify-start mt-1"
  leadingIcon={<Plus size={14} />}
  onClick={() => {
    setOpen(false);
    useNewWorkspaceModalStore.getState().open();
  }}
>
  New Workspace
</GlassButton>
                  </div>
                </div>

                {/* Settings */}
                <Link
                  href="/settings"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-white/60 hover:bg-white/5"
                  onClick={() => setOpen(false)}
                >
                  <Settings size={16} /> Settings
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}