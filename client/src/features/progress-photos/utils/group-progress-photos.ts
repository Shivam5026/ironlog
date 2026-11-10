import type { ProgressPhoto, ProgressPhotoYearGroup } from "../types/progress-photo.types";

export const PROGRESS_PHOTO_CATEGORY_LABELS = {
  FRONT: "Front",
  BACK: "Back",
  LEFT_SIDE: "Left side",
  RIGHT_SIDE: "Right side",
  CUSTOM: "Custom",
} as const;

function recordedTimestamp(photo: ProgressPhoto): number {
  const recorded = new Date(photo.recordedAt).getTime();
  if (!Number.isNaN(recorded)) return recorded;

  const created = new Date(photo.createdAt).getTime();
  return Number.isNaN(created) ? 0 : created;
}

function createdTimestamp(photo: ProgressPhoto): number {
  const created = new Date(photo.createdAt).getTime();
  return Number.isNaN(created) ? 0 : created;
}

/**
 * The API already sorts newest first, but grouping should not depend on that
 * contract. Re-sort defensively using the same keys as the server
 * (`recordedAt desc`, `createdAt desc`).
 */
export function sortProgressPhotosNewestFirst(
  photos: ProgressPhoto[],
): ProgressPhoto[] {
  return [...photos].sort((a, b) => {
    const byRecorded = recordedTimestamp(b) - recordedTimestamp(a);
    if (byRecorded !== 0) return byRecorded;
    return createdTimestamp(b) - createdTimestamp(a);
  });
}

/**
 * Groups a flat timeline into year → month buckets. No grouping data is
 * persisted; this is purely a UI projection of `recordedAt`.
 */
export function groupProgressPhotosByYearAndMonth(
  photos: ProgressPhoto[],
): ProgressPhotoYearGroup[] {
  const buckets = new Map<number, Map<number, ProgressPhoto[]>>();

  for (const photo of sortProgressPhotosNewestFirst(photos)) {
    const date = new Date(photo.recordedAt);
    if (Number.isNaN(date.getTime())) continue;

    const year = date.getFullYear();
    const month = date.getMonth();

    const months = buckets.get(year) ?? new Map<number, ProgressPhoto[]>();
    const monthPhotos = months.get(month) ?? [];
    monthPhotos.push(photo);
    months.set(month, monthPhotos);
    buckets.set(year, months);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => b - a)
    .map(([year, months]) => ({
      year,
      months: Array.from(months.entries())
        .sort(([a], [b]) => b - a)
        .map(([month, monthPhotos]) => ({
          key: `${year}-${String(month + 1).padStart(2, "0")}`,
          year,
          month,
          label: new Date(year, month, 1).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
          photos: monthPhotos,
        })),
    }));
}

export function formatProgressPhotoDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown date";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatProgressPhotoWeight(
  weight: string | number | null,
): string | null {
  if (weight === null || weight === "") return null;

  const value = typeof weight === "number" ? weight : Number(weight);
  if (!Number.isFinite(value)) return null;

  return `${value} kg`;
}

export function countProgressPhotos(group: ProgressPhotoYearGroup): number {
  return group.months.reduce((total, month) => total + month.photos.length, 0);
}
