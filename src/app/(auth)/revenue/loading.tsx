import { SkeletonDashboard } from "@/components/ui/loading-skeleton";

export default function RevenueLoading() {
  return (
    <div className="flex flex-col gap-6">
      <SkeletonDashboard kpiCount={2} />
      {/* Additional skeleton rows matching the page */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <SkeletonDashboard kpiCount={1} />
        </div>
        <div className="lg:col-span-4">
          <SkeletonDashboard kpiCount={1} />
        </div>
      </div>
      <SkeletonDashboard kpiCount={2} />
    </div>
  );
}