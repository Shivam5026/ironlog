import { useQuery } from "@tanstack/react-query";
import {queryKeys} from "@/shared/lib/queryKey";
import { profileApi } from "../api/profile.api";

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: profileApi.getProfile,
  });
}
