"use client";

import { useSubscription } from "@/hooks/use-subscription";
import { GlassButton } from "@/components/ui/glass-button";

export function SubscriptionButton() {
    const { status, loading } = useSubscription();

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
        try {
            const res = await fetch("/api/portal", {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || "Could not open customer portal");
                return;
            }
            if (data.url) {
                window.location.href = data.url;
            }
        } catch {
            alert("Network error. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="h-9 w-20 rounded-lg bg-white/5 animate-pulse" />
        );
    }

    const isPro = status === "pro";

    return (
        <GlassButton
            variant="ghost"
            size="xs"
            onClick={isPro ? handleManage : handleUpgrade}
        >
            {isPro ? "Manage" : "Upgrade"}
        </GlassButton>
    );
}