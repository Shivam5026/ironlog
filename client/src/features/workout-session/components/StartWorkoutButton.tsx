import { Play, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useStartWorkout } from "../hooks/useStartWorkout";

interface StartWorkoutButtonProps {
  workoutPlanId: string;
}

export function StartWorkoutButton({ workoutPlanId }: StartWorkoutButtonProps) {
  const startWorkout = useStartWorkout();

  return (
    <Button
      onClick={() => startWorkout.mutate(workoutPlanId)}
      disabled={startWorkout.isPending}
    >
      {startWorkout.isPending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Play className="h-4 w-4" />
      )}
      {startWorkout.isPending ? "Starting..." : "Start Workout"}
    </Button>
  );
}
