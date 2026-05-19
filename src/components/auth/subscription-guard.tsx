"use client";

import { useSubscription } from "@/hooks/use-subscription";
import { PaywallOverlay } from "@/components/billing/paywall-overlay";
import { SkeletonDashboard } from "@/components/ui/loading-skeleton";

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
    const { status, loading } = useSubscription();

    if (loading) return <SkeletonDashboard kpiCount={6} />;
    if (status === "free") return <PaywallOverlay />;

    return <>{children}</>;
}