import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard";

export function useRecentPlans() {
  return useQuery({
    queryKey: ["dashboard", "recent-plans"],
    queryFn: dashboardApi.getRecentPlans,
  });
}