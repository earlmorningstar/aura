import { MarketingNav } from "../marketing-client";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
    title: "Terms of Service · Aura",
    description: "Terms and conditions for using Aura.",
    path: "/terms",
});

export default function TermsPage() {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const monthName = lastMonth.toLocaleString("default", { month: "long" });
    const year = lastMonth.getFullYear();

    return (
        <div className="min-h-screen bg-[#05050f] text-white">
            <MarketingNav />
            <div className="mx-auto max-w-3xl px-6 py-10">
                <h1 className="font-display text-3.5xl font-bold mb-8 leading-normal">Terms of Service</h1>
                <p className="text-white/70 text-sm mb-8">Last updated: {monthName} {year}</p>
                <div className="space-y-4 text-white/70 leading-relaxed">
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