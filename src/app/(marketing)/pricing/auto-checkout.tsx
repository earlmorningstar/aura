"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

async function getPriceIds() {
    const res = await fetch("/api/stripe-keys");
    return res.json() as Promise<{ starter?: string; pro?: string }>;
}

export function AutoCheckout() {
    const searchParams = useSearchParams();
    const plan = searchParams.get("plan");
    const [priceId, setPriceId] = useState<string | null>(null);

    useEffect(() => {
        if (!plan) return;
        getPriceIds().then((ids) => {
            setPriceId(ids[plan as "starter" | "pro"] ?? null);
        });
    }, [plan]);

    useEffect(() => {
        if (!priceId) return;

        async function checkout() {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            try {
                const res = await fetch("/api/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ priceId }),
                    credentials: "include",
                });

                if (!res.ok) {
                    console.error("Auto checkout failed:", await res.text());
                    return;
                }

                const { url } = await res.json();
                if (url) window.location.href = url;
            } catch (err) {
                console.error("Auto checkout error:", err);
            }
        }

        checkout();
    }, [priceId]);

    return null;
}