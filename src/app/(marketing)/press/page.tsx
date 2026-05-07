import type { Metadata } from "next";
import { MarketingNav } from "../marketing-client";

export const metadata: Metadata = {
    title: "Press · Aura",
    description: "Brand assets and press contact.",
};

export default function PressPage() {
    return (
        <div className="min-h-screen bg-[#05050f] text-white">
            <MarketingNav />
            <div className="mx-auto max-w-3xl px-6 py-10">
                 <h1 className="font-display text-3.5xl font-bold mb-8 leading-normal">Press</h1>
                <p className="text-white/70 mb-8">
                    For media inquiries, brand assets, or interview requests, please email{" "}
                    <span className="text-cyan-400">press@useaura.app</span>.
                </p>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <h2 className="font-semibold mb-3">Brand Assets</h2>
                    <p className="text-sm text-white/60">
                        Download our logo pack and brand guidelines (coming soon).
                    </p>
                </div>
            </div>
        </div>
    );
}