import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/queryKey";
import { workoutPlanApi } from "../api/workout-plans";

export function useWorkoutPlanById(id: string) {
  return useQuery({
    queryKey: [...queryKeys.workoutPlans, id],
    queryFn: () => workoutPlanApi.getPlanById(id),
  });
}
