import { Plus, Dumbbell } from "lucide-react";
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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Workout
          </Button>
        }
      />
    </section>
  );
}
