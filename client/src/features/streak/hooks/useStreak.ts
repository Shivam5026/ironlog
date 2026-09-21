import { useQuery } from "@tanstack/react-query";
import { streakApi } from "../api/streak";

export function useStreak() {
  return useQuery({
    queryKey: ["streak"],
    queryFn: () => streakApi.getStreak(),
  });
}
