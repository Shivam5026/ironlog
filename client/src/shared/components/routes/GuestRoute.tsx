import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/shared/hooks/useAuth";
import { FullPageLoader } from "../ui/FullPageLoader";

export default function GuestRoute() {
  const { data: session, isPending } = useAuth();

  if (isPending) {
    return <FullPageLoader />;
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
