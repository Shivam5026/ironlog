import { Skeleton } from "@/shared/components/ui/Skeleton";

export function ExerciseDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-10 px-6 py-10">
      {/* Hero skeleton */}
      <header className="space-y-6">
        <Skeleton className="h-9 w-36" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-3/4 sm:h-12 lg:h-14" />
          <Skeleton className="h-5 w-full max-w-2xl" />
          <Skeleton className="h-5 w-4/5 max-w-xl" />
        </div>
        <Skeleton className="h-px w-full" />
      </header>

      {/* Main grid skeleton */}
      <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
        <Skeleton className="aspect-square w-full rounded-xl lg:aspect-auto lg:h-[380px]" />

        <div className="grid gap-5 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border p-4">
              <Skeleton className="mb-3 h-5 w-32" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions skeleton */}
      <section className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-5 w-full max-w-2xl" />
          <Skeleton className="h-px w-full" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
                <div className="w-full space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}