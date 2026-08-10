import { useNavigate } from "react-router-dom";
import { LayoutDashboard, History, RotateCcw } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useStartWorkout } from "../hooks/useStartWorkout";

interface SummaryActionsProps {
  workoutPlanId: string;
  workoutDayId: string;
}

export function SummaryActions({ workoutPlanId, workoutDayId }: SummaryActionsProps) {
  const navigate = useNavigate();
  const startWorkout = useStartWorkout();

  const handleRepeat = () => {
    startWorkout.mutate({ workoutPlanId, workoutDayId });
  };

  return (
    <div className="flex flex-wrap gap-3 pt-4">
      <Button variant="outline" onClick={() => navigate("/dashboard")}>
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </Button>
      <Button variant="outline" onClick={() => navigate("/dashboard/workout-history")}>
        <History className="h-4 w-4" />
        Workout History
      </Button>
      <Button onClick={handleRepeat} disabled={startWorkout.isPending}>
        <RotateCcw className="h-4 w-4" />
        {startWorkout.isPending ? "Starting…" : "Repeat Workout"}
      </Button>
    </div>
  );
}