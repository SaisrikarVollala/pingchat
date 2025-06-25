// components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function ProtectedRoute() {
  const { authUser } = useAuthStore();

  if (!authUser) {
    return <Navigate to="/user/login" replace />;
  }

  return <Outlet context={authUser} />;
}