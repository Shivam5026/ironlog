import { useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Loader2, Pencil, Trash2, Plus, Calendar, ClipboardList } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { Separator } from "@/shared/components/ui/Separator";
import { ErrorState } from "@/shared/components/ui/ErrorState";

import { WorkoutPlanHeader } from "../components/WorkoutPlanHeader";
import { WorkoutDayList } from "@/features/workout-days/components/WorkoutDayList";
import { WorkoutDayForm } from "@/features/workout-days/components/WorkoutDayForm";
import { RenameWorkoutDayDialog } from "@/features/workout-days/components/RenameWorkoutDayDialog";
import { DeleteWorkoutDayDialog } from "@/features/workout-days/components/DeleteWorkoutDayDialog";
import { useWorkoutPlanById } from "../hooks/useWorkoutPlanById";
import { useDeleteWorkoutPlan } from "../hooks/useDeleteWorkoutPlan";
import { useWorkoutDays } from "@/features/workout-days/hooks/useWorkoutDays";
import { useDeleteWorkoutDay } from "@/features/workout-days/hooks/useDeleteWorkoutDay";
import type { WorkoutDay } from "@/features/workout-days/types";

export default function WorkoutPlanDetailsPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { data: plan, isPending, isError, error } = useWorkoutPlanById(planId!);
  const { data: days = [], isLoading: daysLoading } = useWorkoutDays(planId!);
  const deletePlan = useDeleteWorkoutPlan();
  const deleteDay = useDeleteWorkoutDay();

  const [deleteTarget, setDeleteTarget] = useState<WorkoutDay | null>(null);
  const [renameTarget, setRenameTarget] = useState<WorkoutDay | null>(null);
  const [showForm, setShowForm] = useState(false);

  if (!planId) {
    return <Navigate to="/dashboard/workout-plans" replace />;
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
        title="Failed to load plan"
        description={error instanceof Error ? error.message : "Something went wrong."}
      />
    );
  }

  if (!plan) {
    return (
      <ErrorState
        title="Plan not found"
        description="This workout plan doesn't exist or may have been deleted."
      />
    );
  }

  const handleDeletePlan = () => {
    deletePlan.mutate(plan.id, {
      onSuccess: () => navigate("/dashboard/workout-plans"),
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <WorkoutPlanHeader
        title={plan.name}
        description={plan.description ?? undefined}
        backLink={{ to: "/dashboard/workout-plans", label: "Back to Workout Plans" }}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/dashboard/workout-plans/${plan.id}/edit`)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDeletePlan} disabled={deletePlan.isPending}>
              <Trash2 className="h-4 w-4" />
              {deletePlan.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          Created {new Date(plan.createdAt).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1.5">
          <ClipboardList className="h-4 w-4" />
          {days.length} {days.length === 1 ? "day" : "days"}
        </span>
      </div>

      <Separator />

      {/* Add day form */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Workout Days</h2>
          {!showForm && (
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Add Day
            </Button>
          )}
        </div>

        {showForm && (
          <div className="rounded-lg border bg-card p-4">
            <WorkoutDayForm
              workoutPlanId={planId}
              onSuccess={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}
      </section>

      {/* Day list */}
      {daysLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <WorkoutDayList
          days={days}
          workoutPlanId={planId}
          onRename={(day) => setRenameTarget(day)}
          onDelete={(day) => setDeleteTarget(day)}
        />
      )}

      {/* Rename dialog */}
      {renameTarget && (
        <RenameWorkoutDayDialog
          day={renameTarget}
          onClose={() => setRenameTarget(null)}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <DeleteWorkoutDayDialog
          dayName={deleteTarget.name}
          isPending={deleteDay.isPending}
          onConfirm={() => {
            deleteDay.mutate(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
