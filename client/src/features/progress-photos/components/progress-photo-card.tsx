import { useState } from "react";
import { ImageOff, Loader2, Scale, Tag, Trash2 } from "lucide-react";

import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { cn } from "@/shared/lib/utils";

import {
  formatProgressPhotoDate,
  formatProgressPhotoWeight,
  PROGRESS_PHOTO_CATEGORY_LABELS,
} from "../utils/group-progress-photos";
import type { ProgressPhoto } from "../types/progress-photo.types";

interface ProgressPhotoCardProps {
  photo: ProgressPhoto;
  onDelete: (photo: ProgressPhoto) => void;
  isDeleting: boolean;
}

export function ProgressPhotoCard({
  photo,
  onDelete,
  isDeleting,
}: ProgressPhotoCardProps) {
  const [imageError, setImageError] = useState(false);

  const categoryLabel = PROGRESS_PHOTO_CATEGORY_LABELS[photo.category];
  const date = formatProgressPhotoDate(photo.recordedAt);
  const weight = formatProgressPhotoWeight(photo.weight);

  return (
    <Card className="overflow-hidden [--card-spacing:0px]">
      <div className="relative">
        {imageError ? (
          <div className="flex aspect-[3/4] flex-col items-center justify-center gap-2 bg-muted text-muted-foreground">
            <ImageOff className="h-8 w-8" aria-hidden="true" />
            <p className="text-xs">Image unavailable</p>
          </div>
        ) : (
          <img
            src={photo.imageUrl}
            alt={`${categoryLabel} progress photo recorded on ${date}`}
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
            className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        )}

        <div className="absolute inset-x-0 top-0 flex justify-end p-2">
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="bg-background/80 shadow-sm backdrop-blur hover:bg-background"
            onClick={() => onDelete(photo)}
            disabled={isDeleting}
            aria-label={`Delete progress photo recorded on ${date}`}
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      <CardContent className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <time dateTime={photo.recordedAt} className="text-sm font-medium">
            {date}
          </time>
          <Badge variant="secondary">{categoryLabel}</Badge>
        </div>

        <div
          className={cn(
            "flex flex-wrap items-center gap-3 text-sm text-muted-foreground",
            !weight && "hidden",
          )}
        >
          {weight && (
            <span className="inline-flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5" aria-hidden="true" />
              {weight}
            </span>
          )}
        </div>

        {photo.notes?.trim() && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {photo.notes}
          </p>
        )}

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Tag className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="capitalize">{categoryLabel.toLowerCase()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
