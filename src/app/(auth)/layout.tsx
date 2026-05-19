import { Suspense } from "react";
import { SkeletonDashboard } from "@/components/ui/loading-skeleton";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ClientPanels } from './client-panels';
import { MobileDashboardHeader } from "@/components/layout/mobile-dashboard-header";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SubscriptionGuard } from "@/components/auth/subscription-guard";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar />
        <div
          className={[
            "flex flex-1 flex-col",
            "lg:pl-[calc(var(--sidebar-width)+48px)]",
            "lg:pr-6",
            "lg:pt-[calc(var(--header-height)+32px)]",
            "lg:pb-6",
            "pl-0 pr-0 pt-0 pb-0",
          ].join(" ")}
        >
          <div
            className="hidden lg:block fixed top-0 right-0 z-[45] h-6 pointer-events-none"
            style={{
              left: "calc(var(--sidebar-width) + 48px)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              background:
                "linear-gradient(to bottom, var(--color-bg-void) 10%, transparent)",
            }}
          />
          <Topbar />
          <MobileDashboardHeader />
          <main className="w-full flex-1 pb-24 lg:pb-0 px-4 pt-6 lg:px-0 lg:pt-0">
            <Suspense fallback={<SkeletonDashboard kpiCount={6} />}>
              <ErrorBoundary>
                <SubscriptionGuard>
                  {children}
                </SubscriptionGuard>
              </ErrorBoundary>
            </Suspense>
          </main>
        </div>
        <MobileNav />
      </div>
      <ClientPanels />
    </>
  );
}