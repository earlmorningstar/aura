import type { Metadata } from "next";
import { MarketingNav } from "../marketing-client";

export const metadata: Metadata = {
    title: "Privacy Policy · Aura",
    description: "How we handle your data.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#05050f] text-white">
            <MarketingNav />
            <div className="mx-auto max-w-3xl px-6 py-24">
                <h1 className="font-display text-4xl font-bold mb-6">Privacy Policy</h1>
                <p className="text-white/70 text-sm mb-8">Last updated: May 2026</p>
                <div className="space-y-4 text-white/70 leading-relaxed">
                    <p>
                        Aura ("we", "us") is committed to protecting your privacy. This policy
                        explains how we handle your data.
                    </p>
                    <h2 className="text-xl font-semibold text-white mt-6">Data we collect</h2>
                    <p>We collect only the information you provide, such as your email address and
                        connected platform data (revenue, followers, content stats). We do not sell
                        or share your personal data.</p>
                    <h2 className="text-xl font-semibold text-white mt-6">Your data storage</h2>
                    <p>Your analytics data is stored in your own Supabase project. We never access
                        it unless you explicitly grant permission for support purposes.</p>
                    <h2 className="text-xl font-semibold text-white mt-6">Contact</h2>
                    <p>If you have any questions, contact us at privacy@useaura.app.</p>
                </div>
            </div>
        </div>
    );
}