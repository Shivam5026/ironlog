import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/shared/hooks/useAuth";
import FullPageLoader from "@/shared/components/common/FullPageLoader";

export default function ProtectedRoute() {
  const { data, isPending } = useAuth();

  if (isPending) {
    return <FullPageLoader />;
  }

  if (!data) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}