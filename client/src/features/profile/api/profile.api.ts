import { api } from "@/shared/lib/axios";

import type { ApiResponse } from "@/shared/types/ApiResponse";
import type {
  UpdateProfilePayload,
  UserProfile,
} from "../types/profile.types";

export const profileApi = {
  async getProfile() {
    const response = await api.get<ApiResponse<UserProfile>>(
      "/profile"
    );

    console.log("profileApi.getProfile response:", response.data);

    return response.data.data;
  },

  async updateProfile(payload: UpdateProfilePayload) {
    const { data } = await api.patch<ApiResponse<UserProfile>>(
      "/profile",
      payload
    );

    return data.data;
  },
};