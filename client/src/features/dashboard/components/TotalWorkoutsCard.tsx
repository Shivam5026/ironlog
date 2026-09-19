import { Dumbbell } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/Card";

interface TotalWorkoutsCardProps {
  total: number;
}

export function TotalWorkoutsCard({ total }: TotalWorkoutsCardProps) {
  return (
    <Card>
      <CardContent className="px-4 py-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Dumbbell className="size-4 text-primary" />
          Total Workouts
        </div>

        <div className="mt-3">
          <p className="text-xl font-bold">{total}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {total === 0
              ? "No workouts yet — complete one to see it count."
              : "All-time completed workouts"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}