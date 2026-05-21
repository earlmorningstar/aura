"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global error:", error);
    }, [error]);

    return (
        <html>
            <body style={{ background: "#05050f" }}>
                <div className="flex min-h-screen items-center justify-center px-4">
                    <div className="text-center max-w-md">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
                            <AlertCircle size={32} className="text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
                        <p className="text-white/60 mb-6">An unexpected error occurred. Please try again.</p>
                        <GlassButton variant="outline" size="md" leadingIcon={<RefreshCw size={16} />} onClick={reset}>
                            Try again
                        </GlassButton>
                    </div>
                </div>
            </body>
        </html>
    );
}