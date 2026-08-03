import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/queryKey";
import { templateApi } from "../api/templates";
import type { UseTemplatePayload } from "../types";

export function useUseTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, ...payload }: { templateId: string } & UseTemplatePayload) =>
      templateApi.useTemplate(templateId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlans });
      toast.success("Plan created from template.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
