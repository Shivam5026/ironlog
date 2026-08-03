import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { templateApi } from "../api/templates";
import type { UpdateTemplatePayload } from "../types";

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, ...payload }: { templateId: string } & UpdateTemplatePayload) =>
      templateApi.updateTemplate(templateId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template updated.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
