import { useNavigate } from "react-router-dom";

import { WorkoutPlanHeader } from "../components/WorkoutPlanHeader";
import WorkoutPlanForm from "../components/WorkoutPlanForm";

export default function CreateWorkoutPlanPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <WorkoutPlanHeader
        title="Create Workout Plan"
        description="Set up a new training routine."
        backLink={{ to: "/dashboard/workout-plans", label: "Back to Workout Plans" }}
      />

      <WorkoutPlanForm onSuccess={() => navigate("/dashboard/workout-plans")} />
    </div>
  );
}
