import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/queryKey";
import { profileApi } from "../api/profile.api";
import { toast } from "sonner";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.updateProfile,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.profile,
      });

      toast.success("Profile updated successfully.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}