import type { HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-12 sm:px-8 sm:py-16 text-center",
        className
      )}
      {...props}
    >
      {Icon && (
        <div className="mb-4 rounded-full bg-muted p-4 text-muted-foreground">
          <Icon className="h-8 w-8" aria-hidden="true" />
        </div>
      )}

      <h3 className="text-lg font-semibold tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}