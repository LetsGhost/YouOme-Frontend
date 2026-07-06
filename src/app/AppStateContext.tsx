import { createContext, use, useMemo } from "react";
import type { ReactNode } from "react";

import { AuthSession, CurrentUser, Group, HealthResponse } from "../shared/api/backend";
import { AdminBundle, useAdminBundleState } from "./appState/useAdminBundleState";
import { useApiBaseUrl } from "./appState/useApiBaseUrl";
import { useGroupsState } from "./appState/useGroupsState";
import { useWebsocketState } from "./appState/useWebsocketState";
import {
  LoginInput,
  Notice,
  NotificationTone,
  RegisterInput,
  RegisterResult,
  useSessionState,
} from "./appState/useSessionState";

export type { AdminBundle } from "./appState/useAdminBundleState";
export type { LoginInput, Notice, NotificationTone, RegisterInput, RegisterResult } from "./appState/useSessionState";

type AppStateValue = {
  apiBaseUrl: string;
  backendUrl: string;
  health: HealthResponse | null;
  session: AuthSession | null;
  currentUser: CurrentUser | null;
  groups: Group[];
  notice: Notice;
  isBootstrapping: boolean;
  isLoginSplashActive: boolean;
  admin: AdminBundle;
  wsConnected: boolean;
  sendWsMessage: (type: string, payload?: Record<string, unknown>) => void;
  subscribeWsEvent: (type: string, handler: (payload: unknown) => void) => () => void;
  setApiBaseUrl: (value: string) => void;
  setNotice: (value: Notice) => void;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<RegisterResult>;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
  deleteCurrentUser: () => Promise<void>;
  updateCurrentUser: (patch: Partial<CurrentUser>) => void;
  probeDevSession: (token?: string) => Promise<void>;
  reloadHealth: () => Promise<void>;
  reloadGroups: () => Promise<void>;
  reloadAdminState: () => Promise<void>;
  clearSession: () => void;
};

export const AppStateContext = createContext<AppStateValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { apiBaseUrl, backendUrl, setApiBaseUrl } = useApiBaseUrl();

  const {
    health,
    reloadHealth,
    session,
    currentUser,
    notice,
    setNotice,
    isBootstrapping,
    isLoginSplashActive,
    login,
    register,
    refreshSession,
    logout,
    deleteCurrentUser,
    updateCurrentUser,
    probeDevSession,
    clearSession,
  } = useSessionState(backendUrl);

  const { groups, reloadGroups } = useGroupsState(backendUrl, session?.accessToken);
  const { admin, reloadAdminState } = useAdminBundleState(backendUrl, session?.accessToken);
  const { wsConnected, sendWsMessage, subscribeWsEvent } = useWebsocketState(backendUrl, session?.accessToken);

  const value = useMemo<AppStateValue>(
    () => ({
      apiBaseUrl,
      backendUrl,
      health,
      session,
      currentUser,
      groups,
      notice,
      isBootstrapping,
      isLoginSplashActive,
      admin,
      wsConnected,
      sendWsMessage,
      subscribeWsEvent,
      setApiBaseUrl,
      setNotice,
      login,
      register,
      refreshSession,
      logout,
      deleteCurrentUser,
      updateCurrentUser,
      probeDevSession,
      reloadHealth,
      reloadGroups,
      reloadAdminState,
      clearSession,
    }),
    [
      apiBaseUrl,
      backendUrl,
      health,
      session,
      currentUser,
      groups,
      notice,
      isBootstrapping,
      isLoginSplashActive,
      admin,
      wsConnected,
      sendWsMessage,
      subscribeWsEvent,
      setApiBaseUrl,
      login,
      register,
      refreshSession,
      logout,
      deleteCurrentUser,
      updateCurrentUser,
      probeDevSession,
      reloadHealth,
      reloadGroups,
      reloadAdminState,
      clearSession,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = use(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used inside AppProvider");
  }

  return context;
}
