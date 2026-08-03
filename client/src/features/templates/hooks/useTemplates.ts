import { useQuery } from "@tanstack/react-query";
import { templateApi } from "../api/templates";

export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: templateApi.getTemplates,
    staleTime: 1000 * 60 * 5,
  });
}
