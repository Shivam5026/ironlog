import { useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Label } from "@/shared/components/ui/Label";

import { useLogin } from "../hooks";
import { loginSchema } from "../schemas";
import type { LoginFormData } from "../types";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/shared/lib/errors";

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const login = useLogin();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const from = (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";

  async function onSubmit(values: LoginFormData) {
    try {
      const result = await login.mutateAsync(values);

      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      toast.success("Welcome back!");

      navigate(from, { replace: true });
    } catch {
      toast.error(getErrorMessage(login.error));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>

        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          autoComplete="email"
          disabled={login.isPending}
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
          autoComplete="current-password"
          disabled={login.isPending}
          {...register("password")}
        />

        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}

        {login.isError && <p className="text-sm text-destructive">Invalid email or password.</p>}
      </div>

      <Button type="submit" className="w-full" disabled={login.isPending}>
        {login.isPending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
        {login.isPending ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
