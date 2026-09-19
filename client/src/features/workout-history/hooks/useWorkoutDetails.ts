import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import { queryKeys } from "@/shared/lib/queryKey";
import { getWorkoutDetails } from "../api/workout-history";

function isNotFound(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 404;
}

export function useWorkoutDetails(sessionId: string) {
  return useQuery({
    queryKey: [...queryKeys.workoutHistory, "details", sessionId],
    queryFn: () => getWorkoutDetails(sessionId),
    enabled: Boolean(sessionId),
    retry: (failureCount, error) =>
      !isNotFound(error) && failureCount < 2,
  });
}

export { isNotFound };