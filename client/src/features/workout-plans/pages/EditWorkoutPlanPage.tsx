import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { ErrorState } from "@/shared/components/ui/ErrorState";

import { WorkoutPlanHeader } from "../components/WorkoutPlanHeader";
import { useWorkoutPlans } from "../hooks/useWorkoutPlans";
import WorkoutPlanForm from "../components/WorkoutPlanForm";

export default function EditWorkoutPlanPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { data: plans, isPending, isError, error } = useWorkoutPlans();

  const plan = plans?.find((p) => p.id === planId);

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

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <WorkoutPlanHeader
        title="Edit Workout Plan"
        description="Update your training routine."
        backLink={{ to: "/dashboard/workout-plans", label: "Back to Workout Plans" }}
      />

      <WorkoutPlanForm
        plan={plan}
        onSuccess={() => navigate("/dashboard/workout-plans")}
      />
    </div>
  );
}
