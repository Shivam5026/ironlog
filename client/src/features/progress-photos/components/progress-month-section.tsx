import { countProgressPhotos } from "../utils/group-progress-photos";
import type { ProgressPhotoMonthGroup } from "../types/progress-photo.types";
import type { ProgressPhoto } from "../types/progress-photo.types";
import { ProgressPhotoCard } from "./progress-photo-card";

interface ProgressMonthSectionProps {
  group: ProgressPhotoMonthGroup;
  onDelete: (photo: ProgressPhoto) => void;
  deletingId: string | null;
}

export function ProgressMonthSection({
  group,
  onDelete,
  deletingId,
}: ProgressMonthSectionProps) {
  return (
    <section className="space-y-3" aria-label={group.label}>
      <div className="flex items-baseline justify-between gap-3 border-b pb-2">
        <h3 className="text-base font-semibold">{group.label}</h3>
        <span className="text-xs text-muted-foreground">
          {group.photos.length} photo{group.photos.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {group.photos.map((photo) => (
          <ProgressPhotoCard
            key={photo.id}
            photo={photo}
            onDelete={onDelete}
            isDeleting={deletingId === photo.id}
          />
        ))}
      </div>
    </section>
  );
}

export function getMonthPhotoCount(group: ProgressPhotoMonthGroup) {
  return countProgressPhotos({ year: group.year, months: [group] });
}
