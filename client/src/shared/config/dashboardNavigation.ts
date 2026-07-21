import { Dumbbell, Home, User,  } from "lucide-react";
import type {LucideIcon} from "lucide-react";

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  end?: boolean;
}

export const dashboardNavigation: DashboardNavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
    title: "Dashboard",
    description: "Welcome back to IronLog.",
    end: true,
  },
  {
    label: "Exercises",
    href: "/dashboard/exercises",
    icon: Dumbbell,
    title: "Exercises",
    description: "Browse and discover exercises.",
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
    title: "Profile",
    description: "Manage your personal information.",
  },
] as const;