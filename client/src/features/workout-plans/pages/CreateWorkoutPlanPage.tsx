import WorkoutPlanDialog from "../components/WorkoutPlanDialog";

export default function CreateWorkoutPlanPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-10">
      <header>
        <h1 className="text-4xl font-bold">Workout Plans</h1>
        <p className="mt-2 text-muted-foreground">
          Create and manage your training routines.
        </p>
      </header>

      <WorkoutPlanDialog />
    </div>
  );
}
