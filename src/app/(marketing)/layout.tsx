import { ParticleSphere } from "@/components/effects/particle-sphere";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <ParticleSphere radius={2} count={4000} color="#6366f1" speed={0.7} />
            {children}
        </>
    );
}