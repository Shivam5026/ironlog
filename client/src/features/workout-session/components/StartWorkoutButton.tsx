import { Play, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useStartWorkout } from "../hooks/useStartWorkout";

interface StartWorkoutButtonProps {
  workoutPlanId: string;
  workoutDayId: string;
  label?: string;
}

export function StartWorkoutButton({ workoutPlanId, workoutDayId, label = "Start Workout" }: StartWorkoutButtonProps) {
  const startWorkout = useStartWorkout();

  return (
    <Button
      onClick={() => startWorkout.mutate({ workoutPlanId, workoutDayId })}
      disabled={startWorkout.isPending}
    >
      {startWorkout.isPending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Play className="h-4 w-4" />
      )}
      {startWorkout.isPending ? "Starting..." : label}
    </Button>
  );
}
