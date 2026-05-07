import type { Metadata } from "next";
import { MarketingNav } from "../marketing-client";

export const metadata: Metadata = {
    title: "System Status · Aura",
    description: "Current operational status of Aura services.",
};

export default function StatusPage() {
    return (
        <div className="min-h-screen bg-[#05050f] text-white">
            <MarketingNav />
            <div className="mx-auto max-w-3xl px-6 py-10 text-center">
                <h1 className="font-display text-3.5xl font-bold mb-8 leading-normal">System Status</h1>
                <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-8 backdrop-blur inline-block">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <span className="relative flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                        </span>
                        <span className="font-semibold text-lg text-green-400">All systems operational</span>
                    </div>
                    <p className="text-sm text-white/60">
                        Aura is up and running. Last checked: {new Date().toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    );
}