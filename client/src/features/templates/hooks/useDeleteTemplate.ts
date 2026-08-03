import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { templateApi } from "../api/templates";

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => templateApi.deleteTemplate(templateId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template deleted.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
