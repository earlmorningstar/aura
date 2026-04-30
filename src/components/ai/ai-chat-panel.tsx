"use client";

/**
 * AIChatPanel — slide‑over panel for the "Ask Aura AI" feature.
 *
 * Opens from the right side when isOpen is true.
 * Sends user question to /api/ai-chat (POST) and displays the answer.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, RefreshCw } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import { cn } from "@/lib/utils";

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatPanel({ isOpen, onClose }: AIChatPanelProps) {
  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    if (!question.trim() || loading) return;
    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
        credentials: 'include',
      });

      if (!res.ok) {
        const msg = res.status === 401 ? "Unauthorized. Please sign in." : "Something went wrong. Try again.";
        throw new Error(msg);
      }

      const data = await res.json() as { answer?: string };
      setAnswer(data.answer ?? "No response received.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
  className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm"
             initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
  className="fixed right-0 top-0 z-[10000] h-full w-full max-w-md flex flex-col"
            style={{
              background: "rgba(10,10,18,0.96)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              borderLeft: "1px solid rgba(var(--glass-border-rgb) / 0.2)",
              boxShadow: "var(--shadow-xl)",
              borderRadius: "var(--radius-2xl) 0 0 var(--radius-2xl)", // rounded only on left
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()} // prevent clicks inside the panel from closing it
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  <Sparkles size={16} style={{ color: "var(--color-bg-void)" }} />
                </div>
                <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  Ask Aura AI
                </h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/5"
                style={{ color: "var(--text-tertiary)" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto px-6">
              {/* Welcome message */}
              {!answer && !error && !loading && (
                <div className="mt-8 text-center">
                  <Sparkles size={24} className="mx-auto mb-3" style={{ color: "var(--accent-purple)" }} />
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Ask me anything about your analytics, content strategy, or revenue.
                  </p>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-16">
                  <RefreshCw size={20} className="animate-spin" style={{ color: "var(--accent-cyan)" }} />
                </div>
              )}

              {/* Error */}
              {error && (
                <div
                  className="mt-6 rounded-xl p-4"
                  style={{
                    background: "rgba(var(--status-error-rgb) / 0.1)",
                    border: "1px solid rgba(var(--status-error-rgb) / 0.2)",
                    color: "var(--status-error)",
                  }}
                >
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Answer */}
              {answer && (
                <motion.div
                  className="mt-6 rounded-xl p-4"
                  style={{ background: "rgba(var(--glass-bg-rgb) / 0.1)", border: "1px solid rgba(var(--glass-border-rgb) / 0.08)" }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                    {answer}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Input area */}
            <div className="p-6 pt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="Ask a question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />
                <GlassButton
                  variant="primary"
                  size="md"
                  leadingIcon={loading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                  onClick={() => void handleSubmit()}
                  disabled={!question.trim() || loading}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}