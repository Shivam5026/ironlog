import { useNavigate, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { ErrorState } from "@/shared/components/ui/ErrorState";
import { EmptyState } from "@/shared/components/ui/EmptyState";

import { useWorkoutDetails } from "../hooks/useWorkoutDetails";
import { WorkoutDetailsCard } from "../components/WorkoutDetailsCard";
import { formatDuration } from "../utils/format";

export default function WorkoutDetailsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const { data: detail, isPending, isError, error } = useWorkoutDetails(sessionId ?? "");

  if (!sessionId) {
    return <Navigate to="/dashboard/workout-history" replace />;
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load workout"
        description={error instanceof Error ? error.message : "Something went wrong."}
      />
    );
  }

  if (!detail) {
    return (
      <EmptyState
        title="Workout not found"
        description="This workout could not be found or was deleted."
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate("/dashboard/workout-history")}
      >
        <ArrowLeft className="size-4" />
        Back to History
      </Button>

      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight capitalize">{detail.planName}</h1>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-4" />
            {new Date(detail.startedAt).toLocaleString()}
          </span>
          {detail.duration !== null && (
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {formatDuration(detail.duration)}
            </span>
          )}
          <span className="font-medium text-foreground">
            {Math.round(detail.totalVolume)} kg total volume
          </span>
        </p>
      </div>

      <WorkoutDetailsCard detail={detail} />
    </div>
  );
}
