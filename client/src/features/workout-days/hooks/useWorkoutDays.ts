import { useQuery } from "@tanstack/react-query";
import { workoutDayApi } from "../api/workout-days";

export function useWorkoutDays(workoutPlanId: string) {
  return useQuery({
    queryKey: ["workout-days", workoutPlanId],
    queryFn: () => workoutDayApi.getWorkoutDays(workoutPlanId),
    enabled: !!workoutPlanId,
    // keep fresh so the new exercise shows immediately (no 5-min default staleness)
    staleTime: 0,
  });
}
