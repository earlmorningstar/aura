"use client";

import { useNetworkStatus } from "@/hooks/use-network-status";

export function OfflineBanner() {
    const { isOnline } = useNetworkStatus();

    if (isOnline) return null;

    return (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-red-500/90 text-white text-sm font-medium backdrop-blur shadow-lg animate-pulse">
            You’re offline. Some features may be unavailable.
        </div>
    );
}