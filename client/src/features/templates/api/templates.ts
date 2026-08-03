import { api } from "@/shared/lib/axios";
import type { ApiResponse } from "@/shared/types/ApiResponse";
import type {
  WorkoutTemplate,
  CreateTemplatePayload,
  UseTemplatePayload,
  UpdateTemplatePayload,
} from "../types";

export const templateApi = {
  async getTemplates() {
    const { data } = await api.get<ApiResponse<WorkoutTemplate[]>>("/templates");
    return data.data;
  },

  async createTemplate(payload: CreateTemplatePayload) {
    const { data } = await api.post<ApiResponse<WorkoutTemplate>>(
      "/templates",
      payload,
    );
    return data.data;
  },

  async updateTemplate(templateId: string, payload: UpdateTemplatePayload) {
    const { data } = await api.put<ApiResponse<WorkoutTemplate>>(
      `/templates/${templateId}`,
      payload,
    );
    return data.data;
  },

  async useTemplate(templateId: string, payload: UseTemplatePayload) {
    const { data } = await api.post<ApiResponse<WorkoutTemplate>>(
      `/templates/${templateId}/use`,
      payload,
    );
    return data.data;
  },

  async deleteTemplate(templateId: string) {
    const { data } = await api.delete<ApiResponse<null>>(
      `/templates/${templateId}`,
    );
    return data.data;
  },
};
