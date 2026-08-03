import { useRecentPlans } from "../hooks/useRecentPlans";
import { RecentPlanCard } from "./RecentPlanCard";
import { RecentPlansSkeleton } from "./RecentPlansSkeleton";
import { EmptyPlans } from "./EmptyPlans";

export function RecentPlans() {
  const { data, isPending } = useRecentPlans();

  if (isPending) return <RecentPlansSkeleton />;

  const plans = data ?? [];
  if (plans.length === 0) return <EmptyPlans />;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {plans.map((plan) => (
        <RecentPlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}