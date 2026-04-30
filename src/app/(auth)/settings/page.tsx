import type { Metadata } from "next";
import { AnimatedPage, AnimatedGroup, AnimatedItem } from "@/components/animated-wrapper";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import {
    User,
    Bell,
    Shield,
    Palette,
    ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
    title: "Settings",
    description: "Manage your Aura account and preferences.",
};

const sections = [
    {
        icon: User,
        title: "Profile",
        description: "Update your display name and email preferences.",
        action: "Edit",
    },
    {
        icon: Bell,
        title: "Notifications",
        description: "Configure how and when you’re notified.",
        action: "Configure",
    },
    {
        icon: Shield,
        title: "Security",
        description: "Manage your password and two‑factor authentication.",
        action: "Manage",
    },
    {
        icon: Palette,
        title: "Appearance",
        description: "Choose between dark, light, and system themes.",
        action: "Customise",
    },
];

export default function SettingsPage() {
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
                        <p
                            className="mt-1 text-sm"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            Manage your account, workspace, and preferences.
                        </p>
                    </div>
                </AnimatedItem>

                <AnimatedItem variant="fadeUp">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {sections.map((s) => {
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
                                        <h3
                                            className="font-display font-semibold text-sm"
                                            style={{ color: "var(--text-primary)" }}
                                        >
                                            {s.title}
                                        </h3>
                                        <p
                                            className="text-xs mt-0.5"
                                            style={{ color: "var(--text-muted)" }}
                                        >
                                            {s.description}
                                        </p>
                                    </div>
                                    <GlassButton variant="ghost" size="xs" trailingIcon={<ChevronRight size={14} />} asChild>
                                        <button>{s.action}</button>
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