import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { bodyWeightApi } from "../api/body-weight";
import type {
  CreateBodyWeightPayload,
  UpdateBodyWeightPayload,
} from "../types/body-weight.types";

const QUERY_KEY = ["body-weight"] as const;

export function useBodyWeight() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => bodyWeightApi.getHistory(365),
  });

  const createWeight = useMutation({
    mutationFn: (payload: CreateBodyWeightPayload) =>
      bodyWeightApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Weight logged.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateWeight = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateBodyWeightPayload;
    }) => bodyWeightApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Weight updated.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteWeight = useMutation({
    mutationFn: (id: string) => bodyWeightApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Weight entry deleted.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    query,
    createWeight,
    updateWeight,
    deleteWeight,
  };
}
