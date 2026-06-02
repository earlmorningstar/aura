"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useSubscription() {
    const { data, isLoading } = useQuery({
        queryKey: ["subscription"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return { status: "free", plan: "free", isTrialing: false };

            const { data: profile } = await supabase
                .from("profiles")
                .select("plan, created_at, paid_until")
                .eq("id", user.id)
                .single();

            if (!profile) return { status: "free", plan: "free", isTrialing: false };

            const createdAt = profile.created_at
                ? new Date(profile.created_at).getTime()
                : 0;
            const now = Date.now();
            const fourteenDays = 14 * 24 * 60 * 60 * 1000;
            const isTrialing = createdAt > 0 && now - createdAt < fourteenDays;

            // If the user has a real paid plan and paid_until is still in the future
            if (profile.plan && profile.plan !== "free" && profile.paid_until) {
                const paidUntil = new Date(profile.paid_until).getTime();
                if (paidUntil > now) {
                    return { status: profile.plan, plan: profile.plan, isTrialing: false };
                }
                // Paid period expired – fall back to free
                return { status: "free", plan: "free", isTrialing: false };
            }

            // Trial logic
            if (isTrialing) {
                return { status: "pro", plan: "free", isTrialing: true };
            }

            return { status: "free", plan: "free", isTrialing: false };
        },
        staleTime: 5 * 60 * 1000,
        refetchInterval: (query) => {
            // Only refetch if currently free (to catch new payments)
            if (query.state.data?.status === "free") return 10_000;
            return false;
        },
    });

    return {
        status: data?.status ?? "free",
        plan: data?.plan ?? "free",
        isTrialing: data?.isTrialing ?? false,
        loading: isLoading,
    };
}