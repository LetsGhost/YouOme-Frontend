import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAppState } from "./AppStateContext";

export function AdminRoute({ children }: { children: ReactNode }) {
  const { currentUser, isBootstrapping } = useAppState();
  const location = useLocation();

  if (isBootstrapping) {
    return <div className="auth-screen"><div className="auth-card panel">Loading session...</div></div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (currentUser.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
