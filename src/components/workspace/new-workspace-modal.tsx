"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import { useNewWorkspaceModalStore } from "@/stores/new-workspace-modal-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { Workspace } from "@/stores/workspace-store";
import { notify } from "@/lib/notify";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 60);
}

export function NewWorkspaceModal() {
  const { isOpen, close } = useNewWorkspaceModalStore();
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const { setWorkspace } = useWorkspaceStore();
  const queryClient = useQueryClient();

  const reset = () => {
    setName("");
    setError(null);
    setSubmitting(false);
    setSuccess(false);
  };

  const handleClose = () => {
    reset();
    close();
  };


  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    if (trimmed.length > 50) {
      setError("Name must be under 50 characters");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const slug = generateSlug(trimmed);
        const { data, error: insertError } = await supabase
          .from("workspaces")
          .insert({ name: trimmed, slug, user_id: user.id })
          .select("slug, name")
          .single();

        if (insertError) {
          console.warn("Insert failed, saving locally:", insertError.message);
          // RLS error or other – fallback to local
          const newWs = { slug, name: trimmed };
          const prev = queryClient.getQueryData<Workspace[]>(["workspaces"]) ?? [];
          queryClient.setQueryData<Workspace[]>(["workspaces"], [...prev, newWs]);
          setWorkspace(slug);
          setSuccess(true);
          setSubmitting(false);
          setTimeout(() => handleClose(), 1500);
          return;
        }
        setSuccess(true);
        await queryClient.invalidateQueries({ queryKey: ["workspaces"] });
        setWorkspace(data.slug);
        await notify(user.id, "Workspace created", `"${trimmed}" workspace added.`, "workspace");
      } else {
        // ── Local-only fallback (no user signed in) ──
        const slug = generateSlug(trimmed);
        const newWs = { slug, name: trimmed };
        // Append to the current workspace list in the cache
        const prev = queryClient.getQueryData<Workspace[]>(["workspaces"]) ?? [];
        queryClient.setQueryData<Workspace[]>(["workspaces"], [...prev, newWs]);

        setWorkspace(slug);
        setSuccess(true);
      }
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      console.error("Unexpected error:", err);
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            className="relative w-full max-w-sm rounded-2xl p-6"
            style={{
              background: "rgba(10,10,18,0.92)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid rgba(var(--glass-border-rgb) / 0.2)",
              boxShadow: "var(--shadow-lg)",
            }}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {success ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <CheckCircle2 size={32} style={{ color: "var(--status-success)" }} />
                </motion.div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  Workspace created!
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                    New Workspace
                  </h2>
                  <button
                    onClick={handleClose}
                    className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/5"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                      Workspace Name
                    </span>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Agency clients"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={50}
                      autoFocus
                    />
                  </label>

                  {error && (
                    <div
                      className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
                      style={{
                        background: "rgba(var(--status-error-rgb) / 0.1)",
                        border: "1px solid rgba(var(--status-error-rgb) / 0.2)",
                        color: "var(--status-error)",
                      }}
                    >
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}

                  <GlassButton
                    variant="primary"
                    size="md"
                    className="w-full"
                    loading={submitting}
                    leadingIcon={<Plus size={14} />}
                    onClick={() => void handleSubmit()}
                    disabled={name.trim().length < 2 || submitting}
                  >
                    Create Workspace
                  </GlassButton>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}