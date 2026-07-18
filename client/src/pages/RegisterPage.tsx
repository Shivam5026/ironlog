import { Link } from "react-router-dom";

import RegisterForm from "@/features/auth/components/RegisterForm";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Create an account</CardTitle>

        <CardDescription>Start tracking your workouts with IronLog.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <RegisterForm />

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
