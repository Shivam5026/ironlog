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

import {ProfilePage} from "@/features/profile/page/ProfilePage";

export const router = createBrowserRouter([
  // Public
  {
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },

  // Guest-only routes
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

  // Protected routes
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
      ],
    },
  ],
},
{
  path: "*",
  element: <NotFoundPage />,
}
])
