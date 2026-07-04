import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAppState } from "./AppStateContext";
import { LoadingScreen } from "../widgets/layout/LoadingScreen";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { currentUser, isBootstrapping } = useAppState();
  const location = useLocation();

  if (isBootstrapping) {
    return <LoadingScreen label="Loading session..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
