import type { ReactNode } from "react";

interface WorkoutPlanHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  backLink?: { to: string; label: string };
}

export function WorkoutPlanHeader({ title, description, action, backLink }: WorkoutPlanHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        {backLink && (
          <a
            href={backLink.to}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            ← {backLink.label}
          </a>
        )}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
