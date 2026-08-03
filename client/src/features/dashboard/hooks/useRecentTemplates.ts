import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard";

export function useRecentTemplates() {
  return useQuery({
    queryKey: ["dashboard", "recent-templates"],
    queryFn: dashboardApi.getRecentTemplates,
  });
}