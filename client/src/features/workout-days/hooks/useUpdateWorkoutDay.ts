import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/queryKey";
import { workoutDayApi } from "../api/workout-days";
import type { UpdateWorkoutDayPayload } from "../types";

export function useUpdateWorkoutDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWorkoutDayPayload }) =>
      workoutDayApi.updateWorkoutDay(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlans });
      toast.success("Workout day renamed.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
