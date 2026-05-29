"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";

export function PaywallOverlay() {
    const router = useRouter();

    return (
        <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <motion.div
                className="w-full max-w-md rounded-3xl p-8 text-center"
                style={{
                    background: "rgba(10,10,18,0.96)",
                    backdropFilter: "blur(40px)",
                    border: "1px solid rgba(var(--glass-border-rgb) / 0.2)",
                    boxShadow: "var(--shadow-xl)",
                }}
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
                <div
                    className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{ background: "var(--gradient-brand)" }}
                >
                    <Sparkles size={30} style={{ color: "var(--color-bg-void)" }} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Pro Trial Expired</h2>
                <p className="text-white/60 mb-8">
                    Upgrade to Pro to keep accessing all features, real‑time analytics, and AI‑powered insights.
                </p>
                <div className="flex flex-col gap-3">
                    <GlassButton
                        variant="primary"
                        size="md"
                        className="w-full"
                        onClick={() => router.push("/pricing")}
                    >
                        See plans
                    </GlassButton>
                    <GlassButton variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                        Maybe later
                    </GlassButton>
                </div>
            </motion.div>
        </motion.div>
    );
}