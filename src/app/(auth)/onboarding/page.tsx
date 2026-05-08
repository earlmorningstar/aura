"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { GlassButton } from "@/components/ui/glass-button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function OnboardingPage() {
    const router = useRouter();
    const [displayName, setDisplayName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Load existing name if already set
    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase
                .from("profiles")
                .select("display_name")
                .eq("id", user.id)
                .single();
            if (data?.display_name) setDisplayName(data.display_name);
        }
        load();
    }, []);

    const handleSave = async () => {
        if (displayName.trim().length < 2) {
            setError("Name must be at least 2 characters");
            return;
        }
        setLoading(true);
        setError("");

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error: updateError } = await supabase
            .from("profiles")
            .update({
                display_name: displayName.trim(),
                onboarding_completed: true,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

        if (updateError) {
            setError(updateError.message);
            setLoading(false);
            return;
        }

        router.push("/dashboard");
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-void)] px-4">
            <motion.div
                className="w-full max-w-md rounded-3xl p-8"
                style={{
                    background: "rgba(var(--glass-bg-rgb) / var(--glass-opacity-3))",
                    backdropFilter: "blur(40px)",
                    border: "1px solid rgba(var(--glass-border-rgb) / var(--glass-border-opacity-strong))",
                    boxShadow: "0 24px 64px -8px rgba(0,0,0,0.5)",
                }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex justify-center mb-6">
                    <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl"
                        style={{ background: "var(--gradient-brand)" }}
                    >
                        <Sparkles size={28} style={{ color: "var(--color-bg-void)" }} />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-white text-center mb-4">Welcome to Aura</h1>
                <p className="text-white/60 text-center mb-8">
                    Let's set up your profile. What should we call you?
                </p>

                <div className="flex flex-col gap-4">
                    <input
                        type="text"
                        className="input"
                        placeholder="Your name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        maxLength={50}
                        autoFocus
                    />
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <GlassButton
                        variant="primary"
                        size="md"
                        className="w-full"
                        loading={loading}
                        trailingIcon={<ArrowRight size={16} />}
                        onClick={() => void handleSave()}
                        disabled={!displayName.trim()}
                    >
                        Continue to Dashboard
                    </GlassButton>
                </div>
            </motion.div>
        </div>
    );
}