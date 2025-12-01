import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

interface RequireCustomerProps {
  children: ReactElement;
  redirectTo?: string;
}

export function RequireCustomer({ children, redirectTo = "/login" }: RequireCustomerProps) {
  const { customerSession } = useAppContext();

  if (!customerSession) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
