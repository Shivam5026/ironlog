import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { templateApi } from "../api/templates";
import type { CreateTemplatePayload } from "../types";

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTemplatePayload) =>
      templateApi.createTemplate(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template saved.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
