import { Card, CardContent } from "@/shared/components/ui/Card";

interface WorkoutStatsCardProps {
  totalVolume: number;
  totalReps: number;
  totalSets: number;
  completedSets: number;
  totalExercises: number;
  completedExercises: number;
  estimatedCalories: number;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card px-3 py-4 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function WorkoutStatsCard({
  totalVolume,
  totalReps,
  totalSets,
  completedSets,
  totalExercises,
  completedExercises,
  estimatedCalories,
}: WorkoutStatsCardProps) {
  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Volume" value={`${Math.round(totalVolume)} kg`} />
          <Stat label="Reps" value={String(totalReps)} />
          <Stat label="Sets" value={`${completedSets}/${totalSets}`} />
          <Stat label="Exercises" value={`${completedExercises}/${totalExercises}`} />
          <Stat label="Calories" value={String(estimatedCalories)} />
        </div>
      </CardContent>
    </Card>
  );
}