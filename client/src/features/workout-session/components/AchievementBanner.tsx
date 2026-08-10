import { Award } from "lucide-react";

interface AchievementBannerProps {
  personalRecordCount: number;
  completedExercises: number;
  totalExercises: number;
}

export function AchievementBanner({
  personalRecordCount,
  completedExercises,
  totalExercises,
}: AchievementBannerProps) {
  const allDone = totalExercises > 0 && completedExercises === totalExercises;
  const headline = personalRecordCount > 0
    ? `${personalRecordCount} new personal record${personalRecordCount > 1 ? "s" : ""}!`
    : allDone
      ? "Full workout completed — great consistency."
      : "Workout complete.";

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-gradient-to-r from-amber-500/10 to-emerald-500/10 px-4 py-3">
      <Award className="h-6 w-6 shrink-0 text-amber-500" />
      <p className="text-sm font-medium">{headline}</p>
    </div>
  );
}