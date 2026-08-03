import { Plus, Layout, Dumbbell, Zap } from "lucide-react";

import { QuickActionCard } from "./QuickActionCard";

const actions = [
  { title: "New Plan", icon: Plus, href: "/dashboard/workout-plans/new" },
  { title: "Templates", icon: Layout, href: "/dashboard/templates" },
  { title: "Exercises", icon: Dumbbell, href: "/dashboard/exercises" },
  { title: "Profile", icon: Zap, href: "/dashboard/profile" },
];

export function QuickActions() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((action) => (
        <QuickActionCard key={action.title} {...action} />
      ))}
    </div>
  );
}