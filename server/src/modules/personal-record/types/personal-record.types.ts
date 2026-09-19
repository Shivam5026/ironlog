/**
 * Personal records are always derived from COMPLETED workout data and are
 * persisted in the `PersonalRecord` table by the Personal Record Service.
 *
 * `estimatedOneRepMax` is the highest calculated 1RM across completed sets
 * (Epley), not the 1RM of the heaviest set.
 */
export interface PersonalRecordItem {
  exerciseId: string;
  exerciseName: string;
  bestWeight: number;
  bestVolume: number;
  estimatedOneRepMax: number;
  achievedAt: string;
}

export interface PersonalRecordList {
  items: PersonalRecordItem[];
}

export type PersonalRecordMetric = "WEIGHT" | "VOLUME" | "ONE_REP_MAX";

/**
 * A record that was beaten by the workout currently being completed.
 * `value` is the new all-time best, `previousValue` the record it replaced
 * (0 when there was no prior record).
 */
export interface NewPersonalRecord {
  exerciseId: string;
  exerciseName: string;
  type: PersonalRecordMetric;
  value: number;
  previousValue: number;
}
