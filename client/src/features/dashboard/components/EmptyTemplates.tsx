import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";

export function EmptyTemplates() {
  return (
    <EmptyState
      icon={Bookmark}
      title="No templates found"
      description="Save a template to get started."
      action={
        <Link to="/dashboard/workout-plans">
          <Button size="sm">Browse Plans</Button>
        </Link>
      }
    />
  );
}