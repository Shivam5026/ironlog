import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/queryKey";
import { historyApi } from "../api/history";

export function useWorkoutDetails(sessionId: string) {
  return useQuery({
    queryKey: [...queryKeys.history, "details", sessionId],
    queryFn: () => historyApi.getDetails(sessionId),
  });
}
