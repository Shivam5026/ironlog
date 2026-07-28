import { Link } from "react-router-dom";

import { Button } from "@/shared/components/ui/Button";
import { useAuth } from "@/shared/hooks/useAuth";
import { FullPageLoader } from "@/shared/components/ui/FullPageLoader";

export default function HomePage() {
  const { data: session, isPending } = useAuth();

  if (isPending) {
    return <FullPageLoader />;
  }

  const user = session?.user;

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 text-center">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">
          Welcome to <span className="text-primary">IronLog</span>
        </h1>

        <p className="text-lg text-muted-foreground">
          Track your workouts, monitor your progress, and achieve your fitness
          goals—all in one place.
        </p>

        {user ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Welcome back,{" "}
              <span className="font-semibold">{user.name}</span> 👋
            </p>

            <Link to="/dashboard">
                <Button>
                    Go to Dashboard
                </Button>
            </Link>
          </div>
        ) : (
          <div className="flex justify-center gap-4">
           <Link to="/login">
                <Button>Login</Button>
            </Link>

            <Link to="/register">
                <Button variant="outline">
                    Create Account
                </Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}