import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/shared/lib/errors";
import { queryKeys } from "@/shared/lib/queryKey";

import { progressPhotosApi } from "../api/progress-photos.api";
import type { CreateProgressPhotoPayload } from "../types/progress-photo.types";

export function useProgressPhotos() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.progressPhotos,
    queryFn: () => progressPhotosApi.getAll(),
  });

  const invalidatePhotos = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.progressPhotos });
  };

  const uploadPhoto = useMutation({
    mutationFn: (payload: CreateProgressPhotoPayload) =>
      progressPhotosApi.upload(payload),
    onSuccess: async () => {
      await invalidatePhotos();
      toast.success("Progress photo uploaded.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const deletePhoto = useMutation({
    mutationFn: (id: string) => progressPhotosApi.remove(id),
    onSuccess: async () => {
      await invalidatePhotos();
      toast.success("Progress photo deleted.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  return {
    query,
    uploadPhoto,
    deletePhoto,
  };
}
