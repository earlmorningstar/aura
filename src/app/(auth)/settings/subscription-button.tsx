"use client";

import { useSubscription } from "@/hooks/use-subscription";
import { GlassButton } from "@/components/ui/glass-button";

export function SubscriptionButton() {
    const { plan, isTrialing, loading } = useSubscription();

    const handleUpgrade = async () => {
        const ids = await fetch("/api/stripe-keys").then((r) => r.json());
        const priceId = ids.pro;
        if (!priceId) {
            alert("Price ID missing");
            return;
        }
        const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ priceId }),
            credentials: "include",
        });
        if (!res.ok) {
            alert("Checkout failed");
            return;
        }
        const { url } = await res.json();
        if (url) window.location.href = url;
    };

    const handleManage = async () => {
        const res = await fetch("/api/portal", {
            method: "POST",
            credentials: "include",
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            alert(data.error || "Could not open customer portal");
            return;
        }
        const { url } = await res.json();
        if (url) window.location.href = url;
    };

    if (loading) {
        return <div className="h-9 w-20 rounded-lg bg-white/5 animate-pulse" />;
    }

    // Show Upgrade if trial or free; Manage only if real paid plan
    const isFree = plan === "free" || isTrialing;

    return (
        <GlassButton
            variant="ghost"
            size="xs"
            onClick={isFree ? handleUpgrade : handleManage}
        >
            {isFree ? "Upgrade" : "Manage"}
        </GlassButton>
    );
}