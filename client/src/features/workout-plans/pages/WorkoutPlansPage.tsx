import { Calendar, ClipboardList, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { ErrorState } from "@/shared/components/ui/ErrorState";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Badge } from "@/shared/components/ui/Badge";
import { Separator } from "@/shared/components/ui/Separator";

import { useWorkoutPlans } from "../hooks/useWorkoutPlans";
import WorkoutPlanDialog from "../components/WorkoutPlanDialog";
import type { WorkoutPlan } from "../types";

function PlanCard({ plan }: { plan: WorkoutPlan }) {
  const exerciseCount = 0;

  return (
    <Link to={`/dashboard/workout-plans/${plan.id}`} className="block">
      <Card className="transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-lg capitalize">{plan.name}</CardTitle>

              {plan.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {plan.description}
                </p>
              )}
            </div>

            <Badge variant="secondary" className="shrink-0">
              {plan.workoutDays?.length ?? 0} days
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <Separator className="mb-4" />

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(plan.createdAt).toLocaleDateString()}
            </span>

            <span className="flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4" />
              {exerciseCount} exercises
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function WorkoutPlansPage() {
  const { data: plans, isPending, isError, error } = useWorkoutPlans();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex items-start justify-between gap-4 sm:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Workout Plans</h1>
          <p className="text-muted-foreground">
            Create and manage your training routines.
          </p>
        </div>

        <WorkoutPlanDialog />
      </header>

      {isPending ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to load plans"
          description={error instanceof Error ? error.message : "Something went wrong."}
        />
      ) : !plans || plans.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No workout plans yet"
          description="Create your first workout plan to get started."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}
