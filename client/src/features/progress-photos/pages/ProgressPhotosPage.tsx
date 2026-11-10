import { useState } from "react";
import { Camera, ImagePlus, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { ErrorState } from "@/shared/components/ui/ErrorState";
import { Skeleton } from "@/shared/components/ui/Skeleton";

import { useProgressPhotos } from "../hooks/use-progress-photos";
import { ProgressTimeline } from "../components/progress-timeline";
import { ProgressPhotoUploadDialog } from "../components/progress-photo-upload-dialog";
import type { CreateProgressPhotoPayload, ProgressPhoto } from "../types/progress-photo.types";

function TimelineSkeleton() {
  return (
    <div className="space-y-10">
      {[0, 1].map((sectionIndex) => (
        <div key={sectionIndex} className="space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-3 border-b pb-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-14" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card
                  key={index}
                  className="overflow-hidden [--card-spacing:0px]"
                >
                  <Skeleton className="aspect-[3/4] w-full rounded-none" />
                  <div className="space-y-3 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProgressPhotosPage() {
  const { query, uploadPhoto, deletePhoto } = useProgressPhotos();
  const { data: photos = [], isPending, isError, error, refetch } = query;

  const [uploadOpen, setUploadOpen] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState<ProgressPhoto | null>(null);

  const handleUpload = async (payload: CreateProgressPhotoPayload) => {
    await uploadPhoto.mutateAsync(payload);
  };

  const handleDelete = async () => {
    if (!deletingPhoto) return;
    try {
      await deletePhoto.mutateAsync(deletingPhoto.id);
      setDeletingPhoto(null);
    } catch {
      // The mutation hook surfaces the error via toast.
    }
  };

  const handleDeleteCancel = () => {
    if (deletePhoto.isPending) return;
    setDeletingPhoto(null);
  };

  const deletingId = deletePhoto.isPending ? deletingPhoto?.id ?? null : null;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Camera className="h-8 w-8" aria-hidden="true" />
            Progress Photos
          </h1>
          <p className="text-sm text-muted-foreground">
            Your visual transformation over time.
          </p>
        </div>

        {!isPending && (
          <Button
            onClick={() => setUploadOpen(true)}
            className="gap-2"
            disabled={uploadPhoto.isPending}
          >
            <ImagePlus className="h-4 w-4" />
            Upload Photo
          </Button>
        )}
      </header>

      {isPending && <TimelineSkeleton />}

      {isError && !isPending && (
        <ErrorState
          title="Failed to load progress photos"
          description={
            error instanceof Error ? error.message : "Something went wrong."
          }
          action={
            <Button variant="outline" onClick={() => void refetch()}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </Button>
          }
        />
      )}

      {!isPending && !isError && photos.length === 0 && (
        <EmptyState
          icon={Camera}
          title="No progress photos yet"
          description="Start documenting your transformation by uploading your first photo."
          action={
            <Button onClick={() => setUploadOpen(true)} className="gap-2">
              <ImagePlus className="h-4 w-4" />
              Upload your first photo
            </Button>
          }
        />
      )}

      {!isPending && !isError && photos.length > 0 && (
        <ProgressTimeline
          photos={photos}
          onDelete={setDeletingPhoto}
          deletingId={deletingId}
        />
      )}

      <ProgressPhotoUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        isPending={uploadPhoto.isPending}
        onSubmit={handleUpload}
      />

      {deletingPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleDeleteCancel();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-progress-photo-title"
            className="w-full max-w-sm rounded-xl bg-card p-6 shadow-lg ring-1 ring-foreground/10"
          >
            <div className="space-y-2">
              <h2
                id="delete-progress-photo-title"
                className="text-lg font-semibold tracking-tight"
              >
                Delete this progress photo?
              </h2>
              <p className="text-sm text-muted-foreground">
                This will remove the photo and its storage asset. This action
                cannot be undone.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleDeleteCancel}
                disabled={deletePhoto.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deletePhoto.isPending}
                className="gap-2"
              >
                {deletePhoto.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {deletePhoto.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
