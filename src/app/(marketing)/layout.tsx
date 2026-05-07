import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div className="fixed inset-0 bg-[#05050f] -z-10" />
            <div className="relative z-10 pt-24 px-6 md:px-12">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft size={16} />
                    Back to home
                </Link>
                {children}
            </div>
        </>
    );
}