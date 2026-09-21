import { Flame } from "lucide-react";
import { StreakSummary } from "../components/StreakSummary";

export default function StreakPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Flame className="h-8 w-8" />
          Workout Streaks
        </h1>
        <p className="text-sm text-muted-foreground">
          Your consistency at a glance.
        </p>
      </div>

      <StreakSummary />
    </div>
  );
}
