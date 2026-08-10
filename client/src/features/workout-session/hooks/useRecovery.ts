import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/queryKey";
import { recoveryApi } from "../api/recovery";

export function useRecovery() {
  const queryClient = useQueryClient();

  const activeQuery = useQuery({
    queryKey: queryKeys.recovery,
    queryFn: recoveryApi.getActiveSession,
    staleTime: 30_000,
  });

  const recover = useMutation({
    mutationFn: recoveryApi.recoverSession,
    onSuccess: (session) => {
      queryClient.setQueryData([...queryKeys.workoutSessions, session.id], session);
      queryClient.invalidateQueries({ queryKey: queryKeys.recovery });
      toast.success("Workout recovered.");
    },
    onError: (error) => toast.error(error.message),
  });

  const clear = useMutation({
    mutationFn: recoveryApi.clearRecoveredSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recovery });
    },
    onError: (error) => toast.error(error.message),
  });

  return { ...activeQuery, recover, clear };
}