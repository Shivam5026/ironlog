import { useMemo } from "react";
import type { WorkoutSession } from "../types";

export function useWorkoutProgress(session: WorkoutSession | undefined) {
  return useMemo(() => {
    if (!session) {
      return {
        totalSets: 0,
        completedSets: 0,
        completedExercises: 0,
        totalExercises: 0,
        remainingExercises: 0,
        totalReps: 0,
        totalVolume: 0,
        progressPercent: 0,
      };
    }

    const logs = session.exerciseLogs;
    const totalSets = logs.reduce((sum, log) => sum + log.sets.length, 0);
    const completedSets = logs.reduce(
      (sum, log) => sum + log.sets.filter((set) => set.completed).length,
      0,
    );
    const completedExercises = logs.filter(
      (log) => log.sets.length > 0 && log.sets.every((set) => set.completed),
    ).length;
    const totalExercises = logs.length;
    const remainingExercises = totalExercises - completedExercises;
    const totalReps = logs.reduce(
      (sum, log) => sum + log.sets.reduce((s, set) => s + set.reps, 0),
      0,
    );
    const totalVolume = logs.reduce(
      (sum, log) =>
        sum +
        log.sets
          .filter((set) => set.completed)
          .reduce((s, set) => s + Number(set.weight) * set.reps, 0),
      0,
    );
    const progressPercent =
      totalSets === 0 ? 0 : Math.round((completedSets / totalSets) * 100);

    return {
      totalSets,
      completedSets,
      completedExercises,
      totalExercises,
      remainingExercises,
      totalReps,
      totalVolume,
      progressPercent,
    };
  }, [session]);
}
