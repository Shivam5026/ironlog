import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/queryKey";
import { historyApi } from "../api/history";

export function useDeleteWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => historyApi.delete(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.history });
      toast.success("Workout deleted.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
