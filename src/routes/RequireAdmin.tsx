import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

interface RequireAdminProps {
  children: ReactElement;
  allowRoles?: string[];
  redirectTo?: string;
}

export function RequireAdmin({ children, allowRoles, redirectTo = "/admin/login" }: RequireAdminProps) {
  const { adminSession } = useAppContext();

  if (!adminSession) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowRoles && allowRoles.length > 0) {
    const normalized = allowRoles.map((role) => role.trim().toLowerCase());
    const currentRole = adminSession.rol?.trim().toLowerCase();
    if (!currentRole || !normalized.includes(currentRole)) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return children;
}
