// components/PublicRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function PublicRoute() {
  const { authUser } = useAuthStore();

  if (authUser) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
