import { Link } from "react-router-dom";

import { Card, CardContent } from "@/shared/components/ui/Card";
import { relativeTime } from "@/shared/lib/relativeTime";
import type { RecentPlan } from "../types";

interface RecentPlanCardProps {
  plan: RecentPlan;
}

export function RecentPlanCard({ plan }: RecentPlanCardProps) {
  return (
    <Link to={`/dashboard/workout-plans/${plan.id}`} className="block">
      <Card className="transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
        <CardContent className="px-4 py-4">
          <p className="font-semibold capitalize">{plan.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Last updated {relativeTime(plan.updatedAt)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}