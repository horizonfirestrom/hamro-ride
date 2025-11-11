import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Role } from "../api/authApi";
import type { ReactNode } from "react";

type ProtectedRouteProps = {
  children: ReactNode;
  allow: Role[];
};

export function ProtectedRoute({ children, allow }: ProtectedRouteProps) {
  const { accessToken, role } = useAuth();

  if (!accessToken || !role) return <Navigate to="/login" replace />;
  if (!allow.includes(role)) return <Navigate to="/" replace />;

  return children;
}
