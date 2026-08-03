import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Layers, Copy, Pencil, Trash2, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Separator } from "@/shared/components/ui/Separator";

import { useDeleteWorkoutPlan } from "../hooks/useDeleteWorkoutPlan";
import { useDuplicateWorkoutPlan } from "../hooks/useDuplicateWorkoutPlan";
import { TemplateButton } from "@/features/templates/components/TemplateButton";
import type { WorkoutPlan } from "../types";

interface WorkoutPlanCardProps {
  plan: WorkoutPlan;
}

export function WorkoutPlanCard({ plan }: WorkoutPlanCardProps) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const deletePlan = useDeleteWorkoutPlan();
  const duplicatePlan = useDuplicateWorkoutPlan();

  const days = plan.workoutDays ?? [];
  const dayCount = days.length;
  const exerciseCount = days.reduce((s: number, d: any) => s + (d.exercises?.length ?? 0), 0);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(true);
  };

  const confirmDelete = () => {
    deletePlan.mutate(plan.id);
    setDeleting(false);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(false);
  };

  return (
    <div className="group relative">
      {deleting && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-card/95 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-3 text-center">
            <p className="text-sm font-medium">Delete "{plan.name}"?</p>
            <div className="flex justify-center gap-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={confirmDelete}
                disabled={deletePlan.isPending}
              >
                {deletePlan.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Delete"
                )}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={cancelDelete}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <Link to={`/dashboard/workout-plans/${plan.id}`} className="block">
        <Card className="h-full transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="min-w-0 truncate text-lg capitalize">{plan.name}</CardTitle>
              <Badge variant="secondary" className="shrink-0 group-hover:hidden">
                {dayCount} {dayCount === 1 ? "day" : "days"}
              </Badge>
            </div>
            {plan.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {plan.description}
              </p>
            )}
          </CardHeader>

          <CardContent>
            <Separator className="mb-4" />
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(plan.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <Layers className="h-4 w-4" />
                {exerciseCount} {exerciseCount === 1 ? "exercise" : "exercises"}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>

      <div className="absolute right-3 top-3 z-10 flex gap-1 rounded-lg bg-card/90 p-1 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
        <TemplateButton workoutPlanId={plan.id} planName={plan.name} />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Duplicate plan"
          onClick={(e) => {
            e.stopPropagation();
            duplicatePlan.mutate(plan.id);
          }}
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Edit plan"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/dashboard/workout-plans/${plan.id}/edit`);
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Delete plan"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
