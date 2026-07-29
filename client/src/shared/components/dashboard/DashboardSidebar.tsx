import { NavLink } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

import { dashboardNavigation } from "@/shared/config/dashboardNavigation";


interface DashboardSidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export function DashboardSidebar({ mobile = false, onNavigate }: DashboardSidebarProps) {
  return (
    <aside className="flex h-full w-72 flex-col border-r bg-card">
      <div className="border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">IronLog</h1>

        <p className="mt-1 text-sm text-muted-foreground">Track. Improve. Repeat.</p>
      </div>
      <div className="border-b" />
      <nav className="flex-1 space-y-1 px-3 py-5">
        {dashboardNavigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              onClick={() => {
                if (mobile) {
                  onNavigate?.();
                }
              }}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )
              }
            >
              <Icon
                className={cn("h-5 w-5 transition-transform duration-200 group-hover:scale-110")}
              />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
