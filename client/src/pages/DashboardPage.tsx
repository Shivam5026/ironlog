import { Plus, Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Button } from "@/shared/components/ui/Button";

export default function DashboardPage() {
  return (
    <section className="space-y-2">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <p className="text-muted-foreground">Welcome back to IronLog.</p>

      <EmptyState
        icon={Dumbbell}
        title="No workouts yet"
        description="Create your first workout to get started."
        action={
          <Link to="/dashboard/workout-plans">
            <Button>
              <Plus className="h-4 w-4" />
              Create Workout
            </Button>
          </Link>
        }
      />
    </section>
  );
}
