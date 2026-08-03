import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Layout } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";

export function EmptyPlans() {
  return (
    <EmptyState
      icon={Layout}
      title="No workout plans yet"
      description="Create your first plan."
      action={
        <Link to="/dashboard/workout-plans/new">
          <Button size="sm">Create Plan</Button>
        </Link>
      }
    />
  );
}