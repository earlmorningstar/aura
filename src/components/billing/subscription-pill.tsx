"use client";

import { useSubscription } from "@/hooks/use-subscription";
import { useRouter } from "next/navigation";

export function SubscriptionPill() {
    const { status, loading } = useSubscription();
    const router = useRouter();

    if (loading || status === "free") return null; // only show if pro

    const handleManage = async () => {
        const res = await fetch("/api/portal", {
            method: "POST",
            credentials: "include",
        });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
        else alert("Could not open customer portal");
    };

    return (
        <div className="relative group inline-flex items-center">
            <div
                className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider cursor-pointer"
                style={{
                    background: "rgba(var(--accent-cyan-rgb) / 0.12)",
                    border: "1px solid rgba(var(--accent-cyan-rgb) / 0.25)",
                    color: "var(--accent-cyan)",
                }}
                onClick={handleManage}
            >
                Pro
            </div>
            {/* Tooltip on hover/click */}
            <div
                className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block"
                style={{ zIndex: 50 }}
            >
                <div
                    className="rounded-lg px-3 py-1.5 text-xs whitespace-nowrap"
                    style={{
                        background: "rgba(10,10,18,0.95)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "var(--text-primary)",
                    }}
                >
                    Manage Subscription
                </div>
            </div>
        </div>
    );
}