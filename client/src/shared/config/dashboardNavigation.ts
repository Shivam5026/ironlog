import { Bookmark, BarChart3, ClipboardList, Dumbbell, Flame, History, Home, Scale, Trophy, User } from "lucide-react";
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
    label: "Workout Plans",
    href: "/dashboard/workout-plans",
    icon: ClipboardList,
    title: "Workout Plans",
    description: "Create and manage your training routines.",
  },
  {
    label: "Templates",
    href: "/dashboard/templates",
    icon: Bookmark,
    title: "Templates",
    description: "Reuse saved plans as templates.",
  },
  {
    label: "Workout History",
    href: "/dashboard/workout-history",
    icon: History,
    title: "Workout History",
    description: "Review your past workouts.",
  },
  {
    label: "Body Weight",
    href: "/dashboard/body-weight",
    icon: Scale,
    title: "Body Weight",
    description: "Track your weight over time.",
  },
  {
    label: "Streaks",
    href: "/dashboard/streaks",
    icon: Flame,
    title: "Streaks",
    description: "Your workout consistency.",
  },
  {
    label: "Volume",
    href: "/dashboard/volume",
    icon: BarChart3,
    title: "Volume",
    description: "Training volume over time.",
  },
  {
    label: "Personal Records",
    href: "/dashboard/personal-records",
    icon: Trophy,
    title: "Personal Records",
    description: "Your all-time best lifts.",
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
    title: "Profile",
    description: "Manage your personal information.",
  },
] as const;