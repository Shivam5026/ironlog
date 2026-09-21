import { BarChart3, Activity, Dumbbell, Target } from "lucide-react";
import { VolumeChart } from "../components/VolumeChart";
import { WorkoutFrequencyChart } from "../components/WorkoutFrequencyChart";
import { ExerciseDistributionChart } from "../components/ExerciseDistributionChart";
import { MuscleDistributionChart } from "../components/MuscleDistributionChart";

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <BarChart3 className="h-8 w-8" />
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          Your training volume, frequency, exercise and muscle breakdown.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <BarChart3 className="h-5 w-5" />
          Training Volume
        </h2>
        <VolumeChart />
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Activity className="h-5 w-5" />
          Workout Frequency
        </h2>
        <WorkoutFrequencyChart />
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Dumbbell className="h-5 w-5" />
          Exercise Distribution
        </h2>
        <ExerciseDistributionChart />
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Target className="h-5 w-5" />
          Muscle Distribution
        </h2>
        <MuscleDistributionChart />
      </section>
    </div>
  );
}
