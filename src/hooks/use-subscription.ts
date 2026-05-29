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
                .select("plan, created_at")
                .eq("id", user.id)
                .single();

            if (!profile) return { status: "free", plan: "free", isTrialing: false };

            const createdAt = profile.created_at
                ? new Date(profile.created_at).getTime()
                : 0;
            const now = Date.now();
            const fourteenDays = 14 * 24 * 60 * 60 * 1000;
            const isTrialing = createdAt > 0 && now - createdAt < fourteenDays;
            const plan = profile.plan ?? "free";

            if (isTrialing) {
                // Trial overrides everything – treat as Pro temporarily
                return { status: "pro", plan: "free", isTrialing: true };
            }

            // Real plan: "starter", "pro", or "free"
            return { status: plan, plan, isTrialing: false };
        },
        staleTime: 5 * 60 * 1000,
        refetchInterval: (query) => {
            if (query.state.data?.status === "free" && !query.state.data?.isTrialing) {
                return 10_000;
            }
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