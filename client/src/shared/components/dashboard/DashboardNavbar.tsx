import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/Button";
import { Spinner } from "@/shared/components/ui/Spinner";

import { dashboardNavigation } from "@/shared/config/dashboardNavigation";

import { getErrorMessage } from "@/shared/lib/errors";

import { useLogout } from "@/features/auth/hooks";

import { Menu } from "lucide-react";
import ThemeToggle from "../theme/ThemeToggle";

interface DashboardNavbarProps {
  onMenuClick: () => void;
}

export function DashboardNavbar({ onMenuClick }: DashboardNavbarProps) {
  const navigate = useNavigate();

  const location = useLocation();

  const currentPage =
    dashboardNavigation.find((item) =>
      item.end ? location.pathname === item.href : location.pathname.startsWith(item.href),
    ) ?? dashboardNavigation[0];

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
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-xl font-semibold tracking-tight">{currentPage.title}</h1>

          <p className="text-sm text-muted-foreground">{currentPage.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />

        <Button variant="outline" onClick={handleLogout} disabled={logout.isPending}>
          {logout.isPending && <Spinner className="mr-2" />}

          {logout.isPending ? "Signing out..." : "Logout"}
        </Button>
      </div>
    </header>
  );
}
