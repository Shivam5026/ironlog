import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Dumbbell,
  SearchX,
  Weight,
} from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { ErrorState } from "@/shared/components/ui/ErrorState";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { relativeTime } from "@/shared/lib/relativeTime";
import { formatDuration } from "@/features/workout-session/utils/format";

import { isNotFound, useWorkoutDetails } from "../hooks/useWorkoutDetails";
import { WorkoutHistoryDetails } from "../components/WorkoutHistoryDetails";
import { formatDate, formatVolume } from "../utils/format";

function DetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Card>
        <CardContent className="space-y-6">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function WorkoutDetailsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const { data: detail, isPending, isError, error } = useWorkoutDetails(
    sessionId ?? "",
  );

  if (!sessionId) {
    return <Navigate to="/dashboard/workout-history" replace />;
  }

  const backButton = (
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate("/dashboard/workout-history")}
    >
      <ArrowLeft className="size-4" />
      Back to History
    </Button>
  );

  if (isPending) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        {backButton}
        <DetailsSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        {backButton}
        {isNotFound(error) ? (
          <EmptyState
            icon={SearchX}
            title="Workout not found"
            description="This workout could not be found or is no longer available."
          />
        ) : (
          <ErrorState
            title="Failed to load workout"
            description={
              error instanceof Error ? error.message : "Something went wrong."
            }
          />
        )}
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        {backButton}
        <EmptyState
          icon={SearchX}
          title="Workout not found"
          description="This workout could not be found or is no longer available."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {backButton}

      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {detail.planName}
          <span className="text-muted-foreground"> · {detail.dayName}</span>
        </h1>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            {formatDate(detail.startedAt)}
            <span className="text-muted-foreground/60">
              ({relativeTime(detail.startedAt)})
            </span>
          </span>
          {detail.duration !== null && (
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {formatDuration(detail.duration)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Dumbbell className="size-4" />
            {detail.exerciseCount}{" "}
            {detail.exerciseCount === 1 ? "exercise" : "exercises"}
          </span>
          <span className="flex items-center gap-1.5">
            <Weight className="size-4" />
            {formatVolume(detail.totalVolume)} kg total volume
          </span>
        </p>
      </div>

      <WorkoutHistoryDetails detail={detail} />
    </div>
  );
}