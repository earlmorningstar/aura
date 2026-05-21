"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function useSubscription() {
    const [status, setStatus] = useState<string | null>(null);
    const [plan, setPlan] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("subscription_status, plan, created_at")
                .eq("id", user.id)
                .single();

            if (profile) {
                const createdAt = new Date(profile.created_at).getTime();
                const now = Date.now();

                const fourteenDays = 14 * 24 * 60 * 60 * 1000;

                // Actual plan value
                const planValue =
                    profile?.plan ??
                    profile?.subscription_status ??
                    "free";

                setPlan(planValue);

                // Free trial logic
                if (now - createdAt < fourteenDays) {
                    setStatus("pro");
                } else {
                    setStatus(planValue);
                }
            } else {
                setStatus("free");
                setPlan("free");
            }
            setLoading(false);
        }
        load();
    }, []);

    return {
        status,
        plan,
        loading,
    };
}