import { forwardRef, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "./Input";
import { Button } from "./Button";

type PasswordInputProps = Omit<
  ComponentPropsWithoutRef<typeof Input>,
  "type"
>;

export const PasswordInput = forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={showPassword ? "text" : "password"}
        className={className}
        {...props}
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        tabIndex={-1}
        onClick={() =>
          setShowPassword((prev) => !prev)
        }
        className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2"
        aria-label={
          showPassword
            ? "Hide password"
            : "Show password"
        }
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";