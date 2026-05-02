import type { Metadata } from "next";
import { MarketingNav } from "../marketing-client";

export const metadata: Metadata = {
    title: "Terms of Service · Aura",
    description: "Terms and conditions for using Aura.",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#05050f] text-white">
            <MarketingNav />
            <div className="mx-auto max-w-3xl px-6 py-24 prose prose-invert">
                <h1 className="font-display text-4xl font-bold mb-6">Terms of Service</h1>
                <p className="text-white/70"><em>Last updated: May 2026</em></p>
                <div className="space-y-4 text-white/70 mt-6">
                    <p>
                        By using Aura, you agree to these terms. If you do not agree, please do not
                        use the service.
                    </p>
                    <h2 className="text-xl font-semibold text-white mt-6">1. Account</h2>
                    <p>You are responsible for maintaining the confidentiality of your login
                        credentials.</p>
                    <h2 className="text-xl font-semibold text-white mt-6">2. Content</h2>
                    <p>You retain full ownership of your data. We claim no rights over it.</p>
                    <h2 className="text-xl font-semibold text-white mt-6">3. Termination</h2>
                    <p>You may cancel your account at any time. We reserve the right to suspend
                        accounts that violate these terms.</p>
                    <h2 className="text-xl font-semibold text-white mt-6">4. Disclaimer</h2>
                    <p>Aura is provided "as is". We are not responsible for any damages arising
                        from its use.</p>
                </div>
            </div>
        </div>
    );
}