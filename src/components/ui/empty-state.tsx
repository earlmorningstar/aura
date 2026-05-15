"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <motion.div
            className="flex flex-col items-center justify-center gap-4 py-16 text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
        >
            {icon ? (
                <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{
                        background: "rgba(var(--glass-bg-rgb) / 0.08)",
                        border: "1px solid rgba(var(--glass-border-rgb) / 0.1)",
                        color: "var(--text-muted)",
                    }}
                >
                    {icon}
                </div>
            ) : (
                <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{
                        background: "rgba(var(--glass-bg-rgb) / 0.08)",
                        border: "1px solid rgba(var(--glass-border-rgb) / 0.1)",
                        color: "var(--text-muted)",
                    }}
                >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                    </svg>
                </div>
            )}
            <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                    {title}
                </p>
                <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    {description}
                </p>
            </div>
            {actionLabel && onAction && (
                <GlassButton
                    variant="outline"
                    size="sm"
                    leadingIcon={<Plus size={14} />}
                    onClick={onAction}
                >
                    {actionLabel}
                </GlassButton>
            )}
        </motion.div>
    );
}