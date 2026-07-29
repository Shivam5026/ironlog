import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface FormFieldProps {
  label: ReactNode;
  htmlFor?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  error,
  helperText,
  required = false,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-foreground"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      {children}

      {error ? (
        <p
          className="text-sm text-red-400"
          role="alert"
        >
          {error}
        </p>
      ) : helperText ? (
        <p className="text-sm text-muted-foreground">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}