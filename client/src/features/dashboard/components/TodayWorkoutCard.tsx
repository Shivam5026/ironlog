import { Link } from "react-router-dom";
import { CalendarDays, ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import type { DashboardTodayWorkout } from "../types/dashboard.types";

interface TodayWorkoutCardProps {
  workout: DashboardTodayWorkout | null;
}

export function TodayWorkoutCard({ workout }: TodayWorkoutCardProps) {
  return (
    <Card>
      <CardContent className="px-4 py-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4 text-primary" />
          Today's Workout
        </div>

        {workout ? (
          <div className="mt-3 flex flex-col gap-3">
            <div>
              <p className="text-xl font-bold capitalize">
                {workout.planName}
              </p>
              <p className="text-sm text-muted-foreground capitalize">
                {workout.dayName} · {workout.exerciseCount} exercise
                {workout.exerciseCount === 1 ? "" : "s"}
              </p>
            </div>
            <Link
              to={`/dashboard/workout-plans/${workout.planId}`}
              className="inline-flex"
            >
              <Button size="sm">
                View Plan
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-xl font-bold">No workout scheduled</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a plan to get started.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}