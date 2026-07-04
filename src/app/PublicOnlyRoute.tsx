import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAppState } from "./AppStateContext";
import { LoadingScreen } from "../widgets/layout/LoadingScreen";

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { currentUser, isBootstrapping, isLoginSplashActive } = useAppState();
  const location = useLocation();
  const locationState = location.state as { from?: string } | null;

  if (isBootstrapping) {
    return <LoadingScreen label="Loading session..." />;
  }

  if (isLoginSplashActive) {
    return <LoadingScreen label="Welcome back!" />;
  }

  if (currentUser) {
    return <Navigate to={locationState?.from || "/dashboard"} replace />;
  }

  return <>{children}</>;
}
