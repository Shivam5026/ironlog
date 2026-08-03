import { Skeleton } from "@/shared/components/ui/Skeleton";

export function TemplateSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <Skeleton className="h-5 w-28" />
        </div>
      ))}
    </div>
  );
}