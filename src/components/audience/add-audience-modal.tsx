"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import { supabase } from "@/lib/supabase/client";
import { useWorkspaceStore } from "@/stores/workspace-store";


interface Props {
    open: boolean;
    onClose: () => void;
    onComplete?: () => void;
}

export function AddAudienceModal({ open, onClose, onComplete }: Props) {
    const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
    const [form, setForm] = useState({
        platform: "YouTube",
        followers: "",
        new_followers: "",
        engagement_rate: "",
        avg_views: "",
        recorded_date: new Date().toISOString().slice(0, 10),
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [useCustom, setUseCustom] = useState(false);
    const [customPlatform, setCustomPlatform] = useState("");

    const handleSubmit = async () => {
        const platform = useCustom ? customPlatform.trim() : form.platform;
        if (!platform || !form.followers) return;
        setSubmitting(true);
        setErrorMsg("");

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            setSubmitting(false);
            setErrorMsg("You must be signed in.");
            return;
        }

        try {
            const { error } = await supabase.from("audience_data").insert({
                user_id: user.id,
                workspace_id: currentWorkspace,
                platform,
                followers: parseInt(form.followers),
                new_followers: parseInt(form.new_followers || "0"),
                engagement_rate: parseFloat(form.engagement_rate || "0"),
                avg_views: parseInt(form.avg_views || "0"),
                recorded_date: form.recorded_date,
            });

            if (error) {
                // Provide a friendlier message for duplicate entries
                if (error.message.includes("duplicate key")) {
                    setErrorMsg("An entry for this platform and date already exists. Please choose a different date.");
                } else {
                    setErrorMsg(error.message);
                }
                setSubmitting(false);
                return;
            }

            onComplete?.();
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setForm({
                    platform: "YouTube",
                    followers: "",
                    new_followers: "",
                    engagement_rate: "",
                    avg_views: "",
                    recorded_date: new Date().toISOString().slice(0, 10),
                });
                setSubmitting(false);
            }, 500);
        } catch (err: any) {
            setErrorMsg(err.message || "Something went wrong.");
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <motion.div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        className="relative w-full max-w-md rounded-2xl p-6 overflow-y-auto max-h-[90vh]"
                        style={{
                            background: "rgba(10,10,18,0.92)",
                            backdropFilter: "blur(24px)",
                            border: "1px solid rgba(255,255,255,0.1)",
                        }}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        {success ? (
                            <div className="flex flex-col items-center gap-3 py-6">
                                <CheckCircle2 size={32} style={{ color: "var(--status-success)" }} />
                                <p className="text-white font-medium">Data added!</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold text-white">Add Audience Data</h2>
                                    <button onClick={onClose} className="text-white/50 hover:text-white">
                                        <X size={18} />
                                    </button>
                                </div>

                                {errorMsg && (
                                    <div className="flex items-center gap-2 text-red-400 text-xs mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                                        <AlertCircle size={14} />
                                        {errorMsg}
                                    </div>
                                )}

                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-xs font-medium uppercase tracking-wider text-white/50">Platform</span>
                                        {!useCustom ? (
                                            <div className="flex gap-2 items-center">
                                                <select
                                                    className="input flex-1"
                                                    value={form.platform}
                                                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                                                >
                                                    <option>YouTube</option>
                                                    <option>Twitter/X</option>
                                                    <option>Newsletter</option>
                                                    <option>TikTok</option>
                                                    <option>Instagram</option>
                                                    <option>Blog</option>
                                                    <option>Other</option>
                                                </select>
                                                <button
                                                    type="button"
                                                    className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 hover:bg-white/10 transition-colors text-cyan-400"
                                                    onClick={() => setUseCustom(true)}
                                                >
                                                    Custom
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="text"
                                                    className="input flex-1"
                                                    placeholder="e.g. Patreon"
                                                    value={customPlatform}
                                                    onChange={(e) => setCustomPlatform(e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 hover:bg-white/10 transition-colors text-white/60"
                                                    onClick={() => setUseCustom(false)}
                                                >
                                                    Back
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs text-white/50 uppercase">Followers</span>
                                        <input type="number" className="input" value={form.followers} onChange={e => setForm({ ...form, followers: e.target.value })} />
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs text-white/50 uppercase">New Followers</span>
                                        <input type="number" className="input" value={form.new_followers} onChange={e => setForm({ ...form, new_followers: e.target.value })} />
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs text-white/50 uppercase">Engagement Rate (%)</span>
                                        <input type="number" step="0.1" className="input" value={form.engagement_rate} onChange={e => setForm({ ...form, engagement_rate: e.target.value })} />
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs text-white/50 uppercase">Avg Views</span>
                                        <input type="number" className="input" value={form.avg_views} onChange={e => setForm({ ...form, avg_views: e.target.value })} />
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs text-white/50 uppercase">Date</span>
                                        <input type="date" className="input" value={form.recorded_date} onChange={e => setForm({ ...form, recorded_date: e.target.value })} />
                                    </label>
                                </div>
                                <div className="mt-6">
                                    <GlassButton
                                        variant="primary"
                                        size="md"
                                        className="w-full"
                                        loading={submitting}
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                    >
                                        Add Data
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