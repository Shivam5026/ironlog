import { api } from "@/shared/lib/axios";
import type { ApiResponse } from "@/shared/types/ApiResponse";
import type {
  CreateProgressPhotoPayload,
  ProgressPhoto,
  ProgressPhotoListResponse,
} from "../types/progress-photo.types";

export const progressPhotosApi = {
  /** All of the authenticated user's photos, newest first. */
  async getAll(): Promise<ProgressPhoto[]> {
    const { data } = await api.get<ProgressPhotoListResponse>("/progress-photos");
    return data.data;
  },

  async upload(payload: CreateProgressPhotoPayload): Promise<ProgressPhoto> {
    const formData = new FormData();
    formData.append("photo", payload.photo);
    formData.append("category", payload.category);

    if (payload.weight !== undefined) {
      formData.append("weight", String(payload.weight));
    }
    if (payload.notes) {
      formData.append("notes", payload.notes);
    }
    if (payload.recordedAt) {
      formData.append("recordedAt", payload.recordedAt);
    }

    // Let the browser set the multipart boundary; setting Content-Type
    // manually would omit it.
    const { data } = await api.post<ApiResponse<ProgressPhoto>>(
      "/progress-photos",
      formData,
    );
    return data.data;
  },

  async remove(id: string): Promise<{ id: string } | null> {
    const { data } = await api.delete<ApiResponse<{ id: string }>>(
      `/progress-photos/${id}`,
    );
    return data.data;
  },
};
