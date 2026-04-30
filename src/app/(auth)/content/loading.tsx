import { SkeletonDashboard } from "@/components/ui/loading-skeleton";

export default function ContentLoading() {
  return (
    <div className="flex flex-col gap-6">
      <SkeletonDashboard kpiCount={4} />
      <SkeletonDashboard kpiCount={1} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonDashboard key={i} kpiCount={1} />
        ))}
      </div>
      <SkeletonDashboard kpiCount={1} />
    </div>
  );
}