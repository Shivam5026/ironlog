import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { Input } from "@/shared/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/Select";
import { getErrorMessage } from "@/shared/lib/errors";

import { PROGRESS_PHOTO_CATEGORY_LABELS } from "../utils/group-progress-photos";
import type {
  CreateProgressPhotoPayload,
  ProgressPhotoCategory,
} from "../types/progress-photo.types";

const CATEGORY_OPTIONS: ProgressPhotoCategory[] = [
  "FRONT",
  "BACK",
  "LEFT_SIDE",
  "RIGHT_SIDE",
  "CUSTOM",
];

function nowLocalInputValue(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

interface ProgressPhotoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onSubmit: (payload: CreateProgressPhotoPayload) => Promise<void>;
}

export function ProgressPhotoUploadDialog({
  open,
  onOpenChange,
  isPending,
  onSubmit,
}: ProgressPhotoUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [category, setCategory] = useState<ProgressPhotoCategory>("FRONT");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [recordedAt, setRecordedAt] = useState(nowLocalInputValue);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFile(null);
      setPreviewUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return null;
      });
      setCategory("FRONT");
      setWeight("");
      setNotes("");
      setRecordedAt(nowLocalInputValue());
      setFormError(null);
      return;
    }

    setRecordedAt(nowLocalInputValue());
    setFormError(null);
  }, [open]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return null;
      });
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return url;
    });

    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isPending, onOpenChange]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setFormError(null);
  };

  const handleClose = () => {
    if (isPending) return;
    onOpenChange(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setFormError("Please choose a photo to upload.");
      fileInputRef.current?.focus();
      return;
    }

    let parsedWeight: number | undefined;
    if (weight.trim() !== "") {
      parsedWeight = Number(weight.trim());
      if (
        !Number.isFinite(parsedWeight) ||
        parsedWeight <= 0 ||
        parsedWeight > 9999.99
      ) {
        setFormError("Weight must be between 0 and 9999.99.");
        return;
      }
    }

    const recordedDate = new Date(recordedAt);
    if (Number.isNaN(recordedDate.getTime())) {
      setFormError("Please choose a valid date and time.");
      return;
    }

    setFormError(null);

    try {
      await onSubmit({
        photo: file,
        category,
        weight: parsedWeight,
        notes: notes.trim() || undefined,
        recordedAt: recordedDate.toISOString(),
      });
      onOpenChange(false);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="progress-photo-upload-title"
        className="relative max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-xl bg-card shadow-lg ring-1 ring-foreground/10"
      >
        <div className="flex items-start justify-between gap-3 border-b px-6 py-4">
          <div className="space-y-1">
            <h2
              id="progress-photo-upload-title"
              className="text-lg font-semibold tracking-tight"
            >
              Upload progress photo
            </h2>
            <p className="text-sm text-muted-foreground">
              Add a photo with a category, date, and optional details.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleClose}
            disabled={isPending}
            aria-label="Close upload dialog"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <FormField label="Photo" htmlFor="progress-photo-file" required>
            <div className="space-y-3">
              <Input
                ref={fileInputRef}
                id="progress-photo-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                disabled={isPending}
              />
              {file && (
                <p className="text-xs text-muted-foreground">{file.name}</p>
              )}
              {previewUrl && (
                <div className="overflow-hidden rounded-lg border">
                  <img
                    src={previewUrl}
                    alt="Selected progress photo preview"
                    className="aspect-[3/4] w-full max-w-xs object-cover"
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, or WebP up to 5 MB.
              </p>
            </div>
          </FormField>

          <FormField label="Category" required>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as ProgressPhotoCategory)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {PROGRESS_PHOTO_CATEGORY_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Weight (kg)" htmlFor="progress-photo-weight">
              <Input
                id="progress-photo-weight"
                type="number"
                step="0.01"
                min="0"
                max="9999.99"
                placeholder="e.g. 85.5"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                disabled={isPending}
              />
            </FormField>

            <FormField
              label="Recorded on"
              htmlFor="progress-photo-recorded-at"
              required
            >
              <Input
                id="progress-photo-recorded-at"
                type="datetime-local"
                value={recordedAt}
                onChange={(event) => setRecordedAt(event.target.value)}
                disabled={isPending}
              />
            </FormField>
          </div>

          <FormField label="Notes" htmlFor="progress-photo-notes">
            <textarea
              id="progress-photo-notes"
              rows={3}
              maxLength={2000}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add optional notes about this photo..."
              disabled={isPending}
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
            />
            <p className="text-xs text-muted-foreground">
              {notes.length}/2000
            </p>
          </FormField>

          {formError && (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              {isPending ? "Uploading..." : "Upload photo"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
