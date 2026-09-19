import { Skeleton } from "@/shared/components/ui/Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <Skeleton className="size-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <Skeleton className="size-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}