import type { HTMLAttributes, ReactNode } from "react";
import { AlertTriangle, type LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

interface ErrorStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

export function ErrorState({
  title,
  description,
  icon: Icon = AlertTriangle,
  action,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center sm:px-8 sm:py-16",
        className
      )}
      {...props}
    >
      <div className="mb-4 rounded-full bg-destructive/10 p-4 text-destructive">
        <Icon className="h-8 w-8" aria-hidden="true" />
      </div>

      <h3 className="text-lg font-semibold tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}