import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/Button";
import { Spinner } from "@/shared/components/common/Spinner";
import { getErrorMessage } from "@/shared/lib/errors";

import { useLogout } from "@/features/auth/hooks";

export default function DashboardPage() {
  const navigate = useNavigate();
  const logout = useLogout();

  async function handleLogout() {
    try {
      await logout.mutateAsync();

      toast.success("Logged out successfully.");

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="text-muted-foreground">
          Welcome back to IronLog.
        </p>
      </div>

      <Button
        onClick={handleLogout}
        disabled={logout.isPending}
      >
        {logout.isPending && (
          <Spinner className="mr-2" />
        )}

        {logout.isPending
          ? "Signing out..."
          : "Logout"}
      </Button>
    </section>
  );
}