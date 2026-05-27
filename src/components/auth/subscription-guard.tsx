"use client";

import { useSubscription } from "@/hooks/use-subscription";
import { PaywallOverlay } from "@/components/billing/paywall-overlay";
import { SkeletonDashboard } from "@/components/ui/loading-skeleton";
import { useState } from "react";

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
    const { status, loading } = useSubscription();
    const [bypass, setBypass] = useState(
        typeof window !== "undefined" && sessionStorage.getItem("aura_bypass_paywall") === "true"
    );

    const handleBypass = () => {
        sessionStorage.setItem("aura_bypass_paywall", "true");
        setBypass(true);
    };

    if (loading) return <SkeletonDashboard kpiCount={6} />;

    if (status === "free" && !bypass) {
        return <PaywallOverlay onBypass={handleBypass} />;
    }

    return <>{children}</>;
}