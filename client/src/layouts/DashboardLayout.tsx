import { Outlet } from "react-router-dom";
import { useState } from "react";

import { DashboardNavbar } from "@/shared/components/dashboard/DashboardNavbar";
import { DashboardSidebar } from "@/shared/components/dashboard/DashboardSidebar";

import {
  Sheet,
  SheetContent,
} from "@/shared/components/ui/Sheet";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    </div>
  );
}