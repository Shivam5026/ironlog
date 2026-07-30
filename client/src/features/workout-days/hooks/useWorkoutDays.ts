import { useQuery } from "@tanstack/react-query";
import { workoutDayApi } from "../api/workout-days";

export function useWorkoutDays(workoutPlanId: string) {
  return useQuery({
    queryKey: ["workout-days", workoutPlanId],
    queryFn: () => workoutDayApi.getWorkoutDays(workoutPlanId),
    enabled: !!workoutPlanId,
  });
}
