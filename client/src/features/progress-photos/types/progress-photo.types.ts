export type ProgressPhotoCategory =
  | "FRONT"
  | "BACK"
  | "LEFT_SIDE"
  | "RIGHT_SIDE"
  | "CUSTOM";

export interface ProgressPhoto {
  id: string;
  imageUrl: string;
  category: ProgressPhotoCategory;
  /**
   * Prisma returns `Decimal` for this column, which JSON-serializes to a
   * string. Accept both so the UI stays tolerant of either representation.
   */
  weight: string | number | null;
  notes: string | null;
  recordedAt: string;
  createdAt: string;
}

/**
 * `GET /api/progress-photos` returns the standard response envelope plus a
 * top-level `total` (the full count, even when the page is limited).
 */
export interface ProgressPhotoListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ProgressPhoto[];
  total: number;
}

export interface CreateProgressPhotoPayload {
  photo: File;
  category: ProgressPhotoCategory;
  weight?: number;
  notes?: string;
  recordedAt?: string;
}

export interface ProgressPhotoMonthGroup {
  /** Stable key, e.g. `2026-03`. */
  key: string;
  year: number;
  /** Zero-based, matching `Date#getMonth()`. */
  month: number;
  /** Human label, e.g. `March 2026`. */
  label: string;
  photos: ProgressPhoto[];
}

export interface ProgressPhotoYearGroup {
  year: number;
  months: ProgressPhotoMonthGroup[];
}
