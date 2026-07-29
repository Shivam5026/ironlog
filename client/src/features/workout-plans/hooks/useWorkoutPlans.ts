import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/queryKey";
import { workoutPlanApi } from "../api/workout-plans";

export function useWorkoutPlans() {
  return useQuery({
    queryKey: queryKeys.workoutPlans,
    queryFn: workoutPlanApi.getPlans,
  });
}