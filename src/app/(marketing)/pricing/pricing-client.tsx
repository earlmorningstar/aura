"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

let cachedPriceIds: { starter?: string; pro?: string } | null = null;

async function getPriceIds() {
    if (cachedPriceIds) return cachedPriceIds;
    const res = await fetch("/api/stripe-keys");
    cachedPriceIds = await res.json();
    return cachedPriceIds;
}

export function CheckoutButton({
    priceId,
    label,
}: {
    priceId: "starter" | "pro";
    label: string;
}) {
    const router = useRouter();
    const [actualPriceId, setActualPriceId] = useState<string | null>(null);

    useEffect(() => {
        getPriceIds().then((ids) => {
            if (ids) {
                setActualPriceId(ids[priceId] ?? null);
            }
        });
    }, [priceId]);

    const handleClick = async () => {
        if (!actualPriceId) {
            alert("Price ID is missing. Please check environment variables.");
            return;
        }

        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceId: actualPriceId }),
                credentials: "include",
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                if (res.status === 401) {
                    const redirectTo = `/pricing?plan=${encodeURIComponent(priceId)}`;
                    router.push(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
                    return;
                }
                alert("Checkout failed: " + (data.error || res.statusText));
                return;
            }

            const { url } = await res.json();
            if (url) window.location.href = url;
            else alert("No checkout URL returned.");
        } catch {
            alert("Network error. Please try again.");
        }
    };

    return (
        <button
            onClick={handleClick}
            className="w-full rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-black hover:bg-cyan-300 transition-colors"
        >
            {label}
        </button>
    );
}