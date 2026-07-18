import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

import { Spinner } from "@/shared/components/common/Spinner";
import { getErrorMessage } from "@/shared/lib/errors";

import { useRegister } from "../hooks";
import { registerSchema } from "../schemas";
import type { RegisterFormData } from "../types";

export default function RegisterForm() {
  const navigate = useNavigate();

  const registerMutation = useRegister();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  async function onSubmit(values: RegisterFormData) {
    try {
      const result = await registerMutation.mutateAsync(values);

      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      toast.success("Account created successfully!");

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>

        <Input
          id="name"
          placeholder="John Doe"
          autoComplete="name"
          disabled={registerMutation.isPending}
          {...register("name")}
        />

        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>

        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          autoComplete="email"
          disabled={registerMutation.isPending}
          {...register("email")}
        />

        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>

        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          disabled={registerMutation.isPending}
          {...register("password")}
        />

        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>

        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          disabled={registerMutation.isPending}
          {...register("confirmPassword")}
        />

        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
        {registerMutation.isPending && <Spinner className="mr-2" />}

        {registerMutation.isPending ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
