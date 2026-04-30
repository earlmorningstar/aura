import { SkeletonDashboard } from "@/components/ui/loading-skeleton";

export default function GlobalLoading() {
  return <SkeletonDashboard kpiCount={6} />;
}