import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";

import { DashboardNavbar } from "@/shared/components/dashboard/DashboardNavbar";
import { DashboardSidebar } from "@/shared/components/dashboard/DashboardSidebar";

import {
  Sheet,
  SheetContent,
} from "@/shared/components/ui/Sheet";
import { RecoveryDialog } from "@/features/workout-session/components/RecoveryDialog";
import { useRecovery } from "@/features/workout-session/hooks/useRecovery";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const { data: activeSession } = useRecovery();
  const onLiveWorkout = location.pathname.startsWith("/dashboard/workout/");
  const [dismissed, setDismissed] = useState(false);

  const recoveryOpen =
    !onLiveWorkout && !dismissed && activeSession != null;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block">
        <DashboardSidebar />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0 lg:hidden">
          <DashboardSidebar
            mobile
            onNavigate={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardNavbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <Outlet />
        </main>
      </div>

      {activeSession && (
        <RecoveryDialog
          sessionId={activeSession.id}
          open={recoveryOpen}
          onOpenChange={(open) => {
            if (!open) setDismissed(true);
          }}
        />
      )}
    </div>
  );
}
