import { createBrowserRouter } from "react-router-dom";

import RootLayout from "@/layouts/RootLayout";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";

import GuestRoute from "@/shared/components/routes/GuestRoute";
import ProtectedRoute from "@/shared/components/routes/ProtectedRoute";

import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import NotFoundPage from "@/pages/NotFoundPage";

import { ProfilePage } from "@/features/profile/page/ProfilePage";
import ExerciseLibrary from "@/features/exercise/pages/ExerciseLibrary";
import ExerciseDetails from "@/features/exercise/pages/ExerciseDetails";
import CreateWorkoutPlanPage from "@/features/workout-plans/pages/CreateWorkoutPlanPage";
import EditWorkoutPlanPage from "@/features/workout-plans/pages/EditWorkoutPlanPage";
import WorkoutPlansPage from "@/features/workout-plans/pages/WorkoutPlansPage";
import WorkoutPlanDetailsPage from "@/features/workout-plans/pages/WorkoutPlanDetailsPage";
import LiveWorkoutPage from "@/features/workout-session/pages/LiveWorkoutPage";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },

  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: "/login",
            element: <LoginPage />,
          },
          {
            path: "/register",
            element: <RegisterPage />,
          },
        ],
      },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: "profile",
            element: <ProfilePage />,
          },
          {
            path: "workout-plans",
            children: [
              {
                index: true,
                element: <WorkoutPlansPage />,
              },
              {
                path: "new",
                element: <CreateWorkoutPlanPage />,
              },
              {
                path: ":planId",
                element: <WorkoutPlanDetailsPage />,
              },
              {
                path: ":planId/edit",
                element: <EditWorkoutPlanPage />,
              },
            ],
          },
          {
            path: "templates",
            lazy: () =>
              import("@/features/templates/pages/TemplatesPage").then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: "workout/:sessionId",
            element: <LiveWorkoutPage />,
          },
          {
            path: "workout/:sessionId/summary",
            lazy: () =>
              import("@/features/workout-session/pages/WorkoutSummaryPage").then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: "workout-history",
            lazy: () =>
              import("@/features/workout-session/pages/WorkoutHistoryPage").then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: "workout-history/:sessionId",
            lazy: () =>
              import("@/features/workout-session/pages/WorkoutDetailsPage").then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: "exercises",
            children: [
              {
                index: true,
                element: <ExerciseLibrary />,
              },
              {
                path: ":exerciseId",
                element: <ExerciseDetails />,
              },
            ],
          },
        ],
      },
    ],
  },

  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
