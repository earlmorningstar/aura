"use client";

import { useState } from "react";
import { AnimatedPage, AnimatedGroup, AnimatedItem } from "@/components/animated-wrapper";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { User, Bell, Check, Shield, Palette, ChevronRight, CheckCircle2, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { SubscriptionButton } from "./subscription-button";
import { useSubscription } from "@/hooks/use-subscription";
import { useNotifications } from "@/hooks/use-notifications";

export function SettingsContent() {
    const { displayName, refresh } = useUser();
    const { plan, isTrialing } = useSubscription();
    const isFree = plan === "free" || isTrialing;
    const [showNameEdit, setShowNameEdit] = useState(false);
    const [newName, setNewName] = useState("");
    const [saving, setSaving] = useState(false);
    const [nameError, setNameError] = useState("");
    const { unreadCount, markAllAsRead } = useNotifications();
    const [resetting, setResetting] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [resetError, setResetError] = useState("");

    const handleResetPassword = async () => {
        setResetting(true);
        setResetError("");
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) {
            setResetError("No email found.");
            setResetting(false);
            return;
        }
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: `${window.location.origin}/auth/callback`,
        });
        if (error) {
            setResetError(error.message);
        } else {
            setResetSent(true);
        }
        setResetting(false);
    };

    return (
        <AnimatedPage>
            <AnimatedGroup stagger={0.1} delayChildren={0.05} className="flex flex-col gap-6">
                <AnimatedItem variant="fadeUp">
                    <div>
                        <h1
                            className="font-display font-bold"
                            style={{
                                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                                letterSpacing: "var(--tracking-tight)",
                                color: "var(--text-primary)",
                            }}
                        >
                            Settings
                        </h1>
                        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                            Manage your account, workspace, and preferences.
                        </p>
                    </div>
                </AnimatedItem>

                <AnimatedItem variant="fadeUp">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* ── Profile card (editable) ── */}
                        <GlassCard visual="default" padding="md" className="flex items-center gap-4">
                            <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                style={{
                                    background: "rgba(var(--glass-bg-rgb) / 0.1)",
                                    border: "1px solid rgba(var(--glass-border-rgb) / 0.15)",
                                    color: "var(--accent-cyan)",
                                }}
                            >
                                <User size={18} />
                            </div>
                            <div className="flex-1">
                                {showNameEdit ? (
                                    <div>
                                        <input
                                            type="text"
                                            className="input mb-2"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            autoFocus
                                            placeholder="Your name"
                                        />
                                        <div className="flex gap-2">
                                            <GlassButton
                                                variant="primary"
                                                size="xs"
                                                loading={saving}
                                                onClick={async () => {
                                                    if (newName.trim().length < 2) {
                                                        setNameError("Name must be at least 2 characters");
                                                        return;
                                                    }
                                                    setSaving(true);
                                                    setNameError("");
                                                    const {
                                                        data: { user },
                                                    } = await supabase.auth.getUser();
                                                    if (user) {
                                                        await supabase
                                                            .from("profiles")
                                                            .update({ display_name: newName.trim() })
                                                            .eq("id", user.id);
                                                        refresh();
                                                    }
                                                    setSaving(false);
                                                    setShowNameEdit(false);
                                                }}
                                            >
                                                Save
                                            </GlassButton>
                                            <GlassButton
                                                variant="ghost"
                                                size="xs"
                                                onClick={() => setShowNameEdit(false)}
                                            >
                                                Cancel
                                            </GlassButton>
                                        </div>
                                        {nameError && (
                                            <p className="text-red-400 text-xs mt-1">{nameError}</p>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <h3
                                            className="font-display font-semibold text-sm"
                                            style={{ color: "var(--text-primary)" }}
                                        >
                                            Profile
                                        </h3>
                                        <p
                                            className="text-xs mt-0.5"
                                            style={{ color: "var(--text-muted)" }}
                                        >
                                            {displayName || "Set your display name"}
                                        </p>
                                    </>
                                )}
                            </div>
                            {!showNameEdit && (
                                <GlassButton
                                    variant="ghost"
                                    size="xs"
                                    trailingIcon={<ChevronRight size={14} />}
                                    onClick={() => {
                                        setNewName(displayName);
                                        setShowNameEdit(true);
                                    }}
                                >
                                    Edit
                                </GlassButton>
                            )}
                        </GlassCard>

                        {/* ── Subscription card ── */}
                        <GlassCard visual="default" padding="md" className="flex items-center gap-4">
                            <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                style={{
                                    background: "rgba(var(--accent-cyan-rgb) / 0.1)",
                                    border: "1px solid rgba(var(--accent-cyan-rgb) / 0.15)",
                                    color: "var(--accent-cyan)",
                                }}
                            >
                                <CreditCard size={18} />
                            </div>
                            <div className="flex-1">
                                <h3
                                    className="font-display font-semibold text-sm"
                                    style={{ color: "var(--text-primary)" }}
                                >
                                    Subscription
                                </h3>
                                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                    {isFree ? "Upgrade to Pro for full access" : "Manage your Pro plan"}
                                </p>
                            </div>
                            <SubscriptionButton />
                        </GlassCard>

                        {/* ── Notifications card ── */}

                        <GlassCard visual="default" padding="md" className="flex items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                style={{ background: "rgba(var(--glass-bg-rgb) / 0.1)", border: "1px solid rgba(var(--glass-border-rgb) / 0.15)", color: "var(--accent-cyan)" }}
                            >
                                <Bell size={18} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-display font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Notifications</h3>
                                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                    {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                                </p>
                            </div>
                            {unreadCount > 0 && (
                                <GlassButton variant="ghost" size="xs" leadingIcon={<Check size={14} />} onClick={() => markAllAsRead()}>
                                    Mark all read
                                </GlassButton>
                            )}
                        </GlassCard>

                        {/* ── Security Card ── */}

                        <GlassCard visual="default" padding="md" className="flex items-center gap-4">
                            <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                style={{
                                    background: "rgba(var(--glass-bg-rgb) / 0.1)",
                                    border: "1px solid rgba(var(--glass-border-rgb) / 0.15)",
                                    color: "var(--accent-cyan)",
                                }}
                            >
                                <Shield size={18} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-display font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Security</h3>
                                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                    {resetSent ? "Check your email for a reset link." : "Change your password or enable 2FA."}
                                </p>
                                {resetError && <p className="text-red-400 text-xs mt-1">{resetError}</p>}
                            </div>
                            {!resetSent ? (
                                <GlassButton variant="ghost" size="xs" loading={resetting} onClick={() => void handleResetPassword()}>
                                    Reset password
                                </GlassButton>
                            ) : (
                                <CheckCircle2 size={20} style={{ color: "var(--status-success)" }} />
                            )}
                        </GlassCard>

                        {/* ── Other cards ── */}
                        <GlassCard visual="default" padding="md" className="flex items-center gap-4">
                            <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                style={{
                                    background: "rgba(var(--glass-bg-rgb) / 0.1)",
                                    border: "1px solid rgba(var(--glass-border-rgb) / 0.15)",
                                    color: "var(--accent-cyan)",
                                }}
                            >
                                <Palette size={18} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-display font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Appearance</h3>
                                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Dark mode is the Aura standard. Custom themes coming later.</p>
                            </div>
                            <GlassButton variant="ghost" size="xs" disabled>
                                Soon
                            </GlassButton>
                        </GlassCard>
                    </div>
                </AnimatedItem>
            </AnimatedGroup>
        </AnimatedPage>
    );
}