"use client";

import { AnimatedPage, AnimatedGroup, AnimatedItem } from "@/components/animated-wrapper";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { User, Bell, Shield, Palette, ChevronRight } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";

export function SettingsContent() {
    const { displayName } = useUser();
    const [showNameEdit, setShowNameEdit] = useState(false);
    const [newName, setNewName] = useState("");
    const [saving, setSaving] = useState(false);
    const [nameError, setNameError] = useState("");

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

                        {/* ── Other cards ── */}
                        {[
                            { icon: Bell, title: "Notifications", desc: "Configure how and when you're notified.", action: "Configure" },
                            { icon: Shield, title: "Security", desc: "Manage your password and two‑factor authentication.", action: "Manage" },
                            { icon: Palette, title: "Appearance", desc: "Choose between dark, light, and system themes.", action: "Customise" },
                        ].map((s) => {
                            const Icon = s.icon;
                            return (
                                <GlassCard key={s.title} visual="default" padding="md" className="flex items-center gap-4">
                                    <div
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                        style={{
                                            background: "rgba(var(--glass-bg-rgb) / 0.1)",
                                            border: "1px solid rgba(var(--glass-border-rgb) / 0.15)",
                                            color: "var(--accent-cyan)",
                                        }}
                                    >
                                        <Icon size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-display font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{s.title}</h3>
                                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.desc}</p>
                                    </div>
                                    <GlassButton variant="ghost" size="xs" trailingIcon={<ChevronRight size={14} />}>
                                        {s.action}
                                    </GlassButton>
                                </GlassCard>
                            );
                        })}
                    </div>
                </AnimatedItem>
            </AnimatedGroup>
        </AnimatedPage>
    );
}