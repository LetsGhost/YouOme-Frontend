import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAppState } from "./AppStateContext";
import { LoadingScreen } from "../widgets/layout/LoadingScreen";

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { currentUser, isBootstrapping } = useAppState();

  if (isBootstrapping) {
    return <LoadingScreen label="Loading session..." />;
  }

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
