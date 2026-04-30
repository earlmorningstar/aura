import { SkeletonDashboard } from "@/components/ui/loading-skeleton";

export default function InsightsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <SkeletonDashboard kpiCount={4} />
      <SkeletonDashboard kpiCount={1} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonDashboard key={i} kpiCount={1} />
        ))}
      </div>
    </div>
  );
}