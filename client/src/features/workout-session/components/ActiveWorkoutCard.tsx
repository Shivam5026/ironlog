import { Link } from "react-router-dom";
import { Play, Pause } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import type { WorkoutSession } from "../types";

interface ActiveWorkoutCardProps {
  session: WorkoutSession;
  onPause?: () => void;
  onResume?: () => void;
  isPending?: boolean;
}

const statusLabel: Record<string, string> = {
  ACTIVE: "Active",
  PAUSED: "Paused",
};

export function ActiveWorkoutCard({ session, onPause, onResume, isPending }: ActiveWorkoutCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{session.workoutPlan.name}</CardTitle>
        <CardAction>
          <Badge variant={session.status === "ACTIVE" ? "default" : "secondary"}>
            {statusLabel[session.status] ?? session.status}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Started {new Date(session.startedAt).toLocaleTimeString()}
        </p>
        <div className="flex gap-2">
          {session.status === "PAUSED" ? (
            <Button onClick={onResume} disabled={isPending}>
              <Play className="h-4 w-4" />
              Resume
            </Button>
          ) : (
            <Button variant="outline" onClick={onPause} disabled={isPending}>
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          )}
          <Link to={`/dashboard/workout/${session.id}`}>
            <Button variant="outline">Open</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
