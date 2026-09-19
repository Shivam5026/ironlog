import { Trophy } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/Card";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { ErrorState } from "@/shared/components/ui/ErrorState";
import { EmptyState } from "@/shared/components/ui/EmptyState";

import { usePersonalRecords } from "../hooks/usePerformance";
import { PersonalRecordsList } from "../components/PersonalRecordsList";

function RecordsSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: 6 }, (_, i) => (
        <Card key={i}>
          <CardContent className="space-y-3 py-4">
            <Skeleton className="h-4 w-40" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function PersonalRecordsPage() {
  const { data, isPending, isError, error } = usePersonalRecords();
  const records = data ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Personal Records</h1>
        <p className="text-sm text-muted-foreground">
          Your all-time bests, including estimated one rep max.
        </p>
      </div>

      {isPending ? (
        <RecordsSkeleton />
      ) : isError ? (
        <ErrorState
          title="Failed to load personal records"
          description={
            error instanceof Error ? error.message : "Something went wrong."
          }
        />
      ) : records.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No personal records yet"
          description="Complete a workout with tracked sets to start setting records."
        />
      ) : (
        <PersonalRecordsList records={records} />
      )}
    </div>
  );
}
