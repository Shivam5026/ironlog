import { useMutation } from "@tanstack/react-query";

import { authApi } from "../api";

export function useLogout() {
  return useMutation({
    mutationFn: authApi.logout,
  });
}