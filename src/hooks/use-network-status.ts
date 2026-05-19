"use client";

import { useEffect, useState } from "react";

export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);
    const [showOffline, setShowOffline] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            // Briefly displaying a "Back online" toast
            setShowOffline(false);
        };
        const handleOffline = () => {
            setIsOnline(false);
            setShowOffline(true);
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return { isOnline, showOffline };
}