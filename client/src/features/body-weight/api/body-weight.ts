import { api } from "@/shared/lib/axios";
import type { ApiResponse } from "@/shared/types/ApiResponse";
import type {
  BodyWeightEntry,
  BodyWeightList,
  CreateBodyWeightPayload,
  UpdateBodyWeightPayload,
} from "../types/body-weight.types";

export const bodyWeightApi = {
  async getHistory(limit?: number) {
    const { data } = await api.get<ApiResponse<BodyWeightList>>(
      "/body-weight",
      { params: limit ? { limit } : undefined },
    );
    return data.data;
  },

  async create(payload: CreateBodyWeightPayload) {
    const { data } = await api.post<ApiResponse<BodyWeightEntry>>(
      "/body-weight",
      payload,
    );
    return data.data;
  },

  async update(id: string, payload: UpdateBodyWeightPayload) {
    const { data } = await api.put<ApiResponse<BodyWeightEntry>>(
      `/body-weight/${id}`,
      payload,
    );
    return data.data;
  },

  async remove(id: string) {
    const { data } = await api.delete<ApiResponse<null>>(
      `/body-weight/${id}`,
    );
    return data.data;
  },
};
