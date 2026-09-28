import { Card, CardContent } from "@/shared/components/ui/Card";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { ErrorState } from "@/shared/components/ui/ErrorState";
import { useMuscleHeatmap } from "../hooks/useMuscleHeatmap";
import type { MuscleFrequencyRange } from "../types/analytics.types";

const MUSCLES = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"] as const;

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const MUSCLE_COLORS: Record<string, string> = {
  Chest: "bg-blue-500",
  Back: "bg-emerald-500",
  Legs: "bg-violet-500",
  Shoulders: "bg-amber-500",
  Arms: "bg-rose-500",
  Core: "bg-cyan-500",
};

function getIntensityClass(freq: number, maxFreq: number): string {
  if (maxFreq === 0 || freq === 0) return "bg-muted/30";
  const ratio = freq / maxFreq;
  if (ratio > 0.66) return "opacity-100";
  if (ratio > 0.33) return "opacity-60";
  return "opacity-30";
}

interface Props {
  range?: MuscleFrequencyRange;
}

export function TrainingHeatmap({ range = "weekly" }: Props) {
  const { data, isLoading, error } = useMuscleHeatmap(range);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-2">
            {MUSCLES.map((m) => (
              <div key={m} className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <div className="flex gap-1 flex-1">
                  {WEEKDAY_LABELS.map((_, i) => (
                    <Skeleton key={i} className="h-8 flex-1 rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <ErrorState message="Failed to load training heatmap" />;
  }

  if (!data || data.data.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <EmptyState message="No training data for this period" />
        </CardContent>
      </Card>
    );
  }

  // Build a lookup: muscle → weekday → frequency
  const heatmapData = new Map<string, Map<number, number>>();

  // Find max frequency for intensity scaling
  let maxFreq = 0;
  for (const point of data.data) {
    if (point.frequency > maxFreq) maxFreq = point.frequency;
  }

  // Initialize map
  for (const muscle of MUSCLES) {
    heatmapData.set(muscle, new Map());
  }

  // Populate from data
  for (const point of data.data) {
    const date = new Date(point.date + "T00:00:00");
    const dayIndex = (date.getDay() + 6) % 7; // Mon=0, Sun=6
    const muscleMap = heatmapData.get(point.muscle);
    if (muscleMap) {
      const existing = muscleMap.get(dayIndex) ?? 0;
      muscleMap.set(dayIndex, existing + point.frequency);
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-sm font-medium mb-3">Training Heatmap</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left pr-2 pb-1 font-medium text-muted-foreground" />
                {WEEKDAY_LABELS.map((day) => (
                  <th key={day} className="text-center px-1 pb-1 font-medium text-muted-foreground">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MUSCLES.map((muscle) => (
                <tr key={muscle}>
                  <td className="text-left pr-2 py-0.5 text-muted-foreground whitespace-nowrap">
                    {muscle}
                  </td>
                  {WEEKDAY_LABELS.map((_, dayIndex) => {
                    const freq = heatmapData.get(muscle)?.get(dayIndex) ?? 0;
                    const colorClass = MUSCLE_COLORS[muscle] ?? "bg-gray-500";
                    const intensityClass = getIntensityClass(freq, maxFreq);
                    return (
                      <td key={dayIndex} className="px-1 py-0.5">
                        <div
                          className={`h-8 rounded flex items-center justify-center ${colorClass} ${intensityClass}`}
                          title={`${muscle}: ${freq} session${freq !== 1 ? "s" : ""}`}
                        >
                          <span className="text-[10px] font-medium text-white/90">
                            {freq > 0 ? freq : ""}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
