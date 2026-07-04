import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAppState } from "./AppStateContext";

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { currentUser, isBootstrapping } = useAppState();

  if (isBootstrapping) {
    return <div className="auth-screen"><div className="auth-card panel">Loading session...</div></div>;
  }

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
