import type { Metadata } from "next";
import { MarketingNav } from "../marketing-client";

export const metadata: Metadata = {
  title: "Careers · Aura",
};

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#05050f] text-white">
      <MarketingNav />
      <div className="mx-auto max-w-3xl px-6 py-10 text-center">
        <h1 className="font-display text-3.5xl font-bold mb-8 leading-normal">Careers</h1>
        <p className="text-white/70 text-lg">We’re not hiring right now, but we’d love to hear from you.</p>
        <p className="text-white/50 mt-4">team@useaura.app</p>
      </div>
    </div>
  );
}