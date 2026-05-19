"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = "Delete",
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[10001] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onCancel}
                    />
                    <motion.div
                        className="relative w-full max-w-sm rounded-2xl p-6"
                        style={{
                            background: "rgba(10,10,18,0.96)",
                            backdropFilter: "blur(24px)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            boxShadow: "var(--shadow-lg)",
                        }}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20"
                                >
                                    <AlertTriangle size={18} style={{ color: "var(--status-error)" }} />
                                </div>
                                <h3 className="text-lg font-semibold text-white">{title}</h3>
                            </div>
                            <button onClick={onCancel} className="text-white/50 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>
                        <p className="text-sm text-white/60 mb-6">{message}</p>
                        <div className="flex gap-3 justify-end">
                            <GlassButton variant="ghost" size="sm" onClick={onCancel}>
                                Cancel
                            </GlassButton>
                            <GlassButton
                                variant="primary"
                                size="sm"
                                onClick={onConfirm}
                                className="bg-red-500 hover:bg-red-600 border-red-500"
                            >
                                {confirmLabel}
                            </GlassButton>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}