"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

interface ToastProps {
    show: boolean;
    message: string;
    onDone: () => void;
    duration?: number;
}

export function Toast({ show, message, onDone, duration = 2500 }: ToastProps) {
    useEffect(() => {
        if (!show) return;
        const t = setTimeout(onDone, duration);
        return () => clearTimeout(t);
    }, [show, onDone, duration]);;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{
                        background: "rgba(10,10,18,0.95)",
                        backdropFilter: "blur(24px)",
                        border: "1px solid rgba(var(--status-success-rgb) / 0.3)",
                        boxShadow: "var(--shadow-lg)",
                    }}
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 26 }}
                >
                    <CheckCircle2 size={18} style={{ color: "var(--status-success)" }} />
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {message}
                    </span>
                    <button onClick={onDone} className="text-white/30 hover:text-white/60">
                        <X size={14} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}