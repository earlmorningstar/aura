"use client";

import { Component, type ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback ?? (
                    <motion.div
                        className="flex flex-col items-center justify-center gap-4 py-24 text-center"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div
                            className="flex h-16 w-16 items-center justify-center rounded-2xl"
                            style={{
                                background: "rgba(var(--status-error-rgb) / 0.1)",
                                border: "1px solid rgba(var(--status-error-rgb) / 0.2)",
                            }}
                        >
                            <AlertCircle size={28} style={{ color: "rgb(var(--status-error-rgb))" }} />
                        </div>
                        <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                            Something went wrong
                        </p>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                            An unexpected error occurred. Please try refreshing.
                        </p>
                        <GlassButton
                            variant="ghost"
                            size="sm"
                            leadingIcon={<RefreshCw size={14} />}
                            onClick={() => this.setState({ hasError: false })}
                        >
                            Try again
                        </GlassButton>
                    </motion.div>
                )
            );
        }

        return this.props.children;
    }
}