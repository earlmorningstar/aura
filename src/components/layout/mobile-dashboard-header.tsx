"use client";

import { motion } from "framer-motion";
import { useUser } from "@/hooks/use-user";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useDateRangeStore, type DatePreset } from "@/stores/date-range-store";
import { SubscriptionPill } from "@/components/billing/subscription-pill";

const PRESETS: { label: string; value: DatePreset }[] = [
    { label: "7D", value: "7d" },
    { label: "30D", value: "30d" },
    { label: "90D", value: "90d" },
    { label: "1Y", value: "1y" },
];

export function MobileDashboardHeader() {
    const { displayName } = useUser();
    const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
    const { preset, setPreset } = useDateRangeStore();

    // Get initials from display name
    const initials = displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    // Capitalise workspace name
    const wsName = currentWorkspace
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <motion.div
            className="sticky top-0 z-30 lg:hidden"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
        >
            {/* Gradient accent bar */}
            <div
                className="h-0.5 w-full"
                style={{ background: "var(--gradient-brand)" }}
            />

            <div
                className="flex items-center justify-between px-4 py-4"
                style={{
                    background: "rgba(7,7,15,0.92)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    borderBottom: "1px solid rgba(var(--glass-border-rgb) / 0.08)",
                    boxShadow: "0 4px 20px -8px rgba(0,0,0,0.4)",
                }}
            >
                {/* Left: Avatar + greeting */}
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold"
                        style={{
                            background: "var(--gradient-brand)",
                            color: "var(--color-bg-void)",
                        }}
                    >
                        {initials || "AU"}
                    </div>
                    <div>
                        <p
                            className="text-xs font-medium leading-tight"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            Good {getTimeOfDay()}
                        </p>
                        <p
                            className="text-sm font-semibold leading-tight"
                            style={{ color: "var(--text-primary)" }}
                        >
                            {displayName}
                        </p>
                    </div>
                </div>

                {/* Right: Workspace pill + quick date */}
                <div className="flex items-center gap-2">
                    <SubscriptionPill />
                    {/* Workspace pill */}
                    <div
                        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                        style={{
                            background: "rgba(var(--glass-bg-rgb) / 0.1)",
                            border: "1px solid rgba(var(--glass-border-rgb) / 0.12)",
                            color: "var(--text-secondary)",
                        }}
                    >
                        <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: "var(--accent-cyan)" }}
                        />
                        {wsName}
                    </div>

                    {/* Quick date pills */}
                    <div className="flex items-center gap-0.5 rounded-lg p-0.5" style={{ background: "rgba(var(--glass-bg-rgb) / 0.05)" }}>
                        {PRESETS.map((p) => (
                            <button
                                key={p.value}
                                className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                                style={{
                                    background: preset === p.value ? "rgba(var(--glass-bg-rgb) / 0.15)" : "transparent",
                                    color: preset === p.value ? "var(--text-primary)" : "var(--text-tertiary)",
                                }}
                                onClick={() => setPreset(p.value)}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
}