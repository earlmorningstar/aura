import type { Metadata } from "next";
import { MarketingNav } from "../marketing-client";

export const metadata: Metadata = {
    title: "Contact · Aura",
    description: "Get in touch with the Aura team.",
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[#05050f] text-white">
            <MarketingNav />
            <div className="mx-auto max-w-3xl px-6 py-24 text-center">
                <h1 className="font-display text-4xl font-bold mb-6">Contact us</h1>
                <p className="text-white/70 text-lg mb-8">
                    Have a question, suggestion, or just want to say hi?
                </p>
                <div className="inline-block rounded-2xl border border-cyan-500/20 bg-white/5 p-6 backdrop-blur">
                    <p className="font-semibold mb-2">Email</p>
                    <a href="mailto:hello@useaura.app" className="text-cyan-400 hover:underline">
                        hello@useaura.app
                    </a>
                </div>
            </div>
        </div>
    );
}