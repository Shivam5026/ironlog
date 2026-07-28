import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/shared/hooks/useAuth";
import { FullPageLoader } from "../ui/FullPageLoader";

export default function ProtectedRoute() {
  const { data: session, isPending } = useAuth();
  const location = useLocation();

  if (isPending) {
    return <FullPageLoader />;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
