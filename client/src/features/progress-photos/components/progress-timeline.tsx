import { useMemo } from "react";

import { countProgressPhotos, groupProgressPhotosByYearAndMonth } from "../utils/group-progress-photos";
import type { ProgressPhoto } from "../types/progress-photo.types";
import { ProgressMonthSection } from "./progress-month-section";

interface ProgressTimelineProps {
  photos: ProgressPhoto[];
  onDelete: (photo: ProgressPhoto) => void;
  deletingId: string | null;
}

export function ProgressTimeline({
  photos,
  onDelete,
  deletingId,
}: ProgressTimelineProps) {
  const years = useMemo(
    () => groupProgressPhotosByYearAndMonth(photos),
    [photos],
  );

  if (years.length === 0) return null;

  return (
    <div className="space-y-10">
      {years.map((yearGroup) => (
        <section
          key={yearGroup.year}
          aria-labelledby={`year-${yearGroup.year}`}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <h2
              id={`year-${yearGroup.year}`}
              className="text-2xl font-bold tracking-tight"
            >
              {yearGroup.year}
            </h2>
            <span className="text-sm text-muted-foreground">
              {countProgressPhotos(yearGroup)} photo
              {countProgressPhotos(yearGroup) === 1 ? "" : "s"}
            </span>
          </div>

          <div className="space-y-8">
            {yearGroup.months.map((month) => (
              <ProgressMonthSection
                key={month.key}
                group={month}
                onDelete={onDelete}
                deletingId={deletingId}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
