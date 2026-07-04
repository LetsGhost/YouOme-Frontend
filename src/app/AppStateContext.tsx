import { createContext, use, useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import {
  AuthSession,
  BackendState,
  CurrentUser,
  DEFAULT_API_BASE_URL,
  Group,
  HealthResponse,
  RegisteredJob,
  RegisteredRoute,
  fetchJson,
  getApiBaseUrl,
  listGroups,
  normalizeBaseUrl,
  deleteCurrentUser as deleteCurrentUserRequest,
  readSession,
  register as registerUser,
  saveSession,
  setApiBaseUrl as persistApiBaseUrl,
  login as loginUser,
} from "../shared/api/backend";
import { onSessionExpired } from "../shared/api/sessionEvents";

export type NotificationTone = "idle" | "success" | "warning" | "error" | "info";

export type Notice = {
  tone: NotificationTone;
  message: string;
};

type LoginInput = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

type RegisterInput = {
  email: string;
  name: string;
  password: string;
};

type RegisterResult = {
  message: string;
  email: string;
};

type AdminBundle = {
  state: BackendState | null;
  routes: RegisteredRoute[];
  jobs: RegisteredJob[];
  loadedAt: string | null;
};

type AppStateValue = {
  apiBaseUrl: string;
  backendUrl: string;
  health: HealthResponse | null;
  session: AuthSession | null;
  currentUser: CurrentUser | null;
  groups: Group[];
  notice: Notice;
  isBootstrapping: boolean;
  admin: AdminBundle;
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

const defaultNotice: Notice = {
  tone: "idle",
  message: "",
};

const defaultAdminState: AdminBundle = {
  state: null,
  routes: [],
  jobs: [],
  loadedAt: null,
};

export const AppStateContext = createContext<AppStateValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [apiBaseUrl, setApiBaseUrlState] = useState(() => normalizeBaseUrl(getApiBaseUrl()));
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [session, setSession] = useState<AuthSession | null>(() => readSession());
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => readSession()?.user ?? null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [notice, setNotice] = useState<Notice>(defaultNotice);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [admin, setAdmin] = useState<AdminBundle>(defaultAdminState);

  const backendUrl = useMemo(() => normalizeBaseUrl(apiBaseUrl), [apiBaseUrl]);

  useEffect(() => {
    persistApiBaseUrl(backendUrl);
  }, [backendUrl]);

  useEffect(() => {
    saveSession(session);
  }, [session]);

  useEffect(() => {
    return onSessionExpired(() => {
      setCurrentUser(null);
      setSession(null);
      saveSession(null);
    });
  }, []);

  const reloadHealth = useCallback(async () => {
    const healthSnapshot = await fetchJson<HealthResponse>(`${backendUrl}/health`);
    setHealth(healthSnapshot);
    return;
  }, [backendUrl]);

  const reloadGroups = useCallback(async () => {
    try {
      const groupsSnapshot = await listGroups(backendUrl, session?.accessToken);
      setGroups(groupsSnapshot);
    } catch {
      setGroups([]);
    }
  }, [backendUrl, session?.accessToken]);

  const bootstrapCurrentUser = useCallback(async () => {
    const storedSession = readSession();

    if (storedSession?.accessToken) {
      try {
        const currentUserSnapshot = await fetchJson<CurrentUser>(`${backendUrl}/api/auth/me`, {
          token: storedSession.accessToken,
        });

        setSession({ ...storedSession, user: currentUserSnapshot });
        setCurrentUser(currentUserSnapshot);
        setNotice({ tone: "success", message: "Session restored from local storage." });
        return;
      } catch (error) {
        if (!storedSession.refreshToken) {
          throw error;
        }

        const tokens = await fetchJson<Pick<AuthSession, "accessToken" | "refreshToken">>(
          `${backendUrl}/api/auth/refresh`,
          {
            method: "POST",
            json: { refreshToken: storedSession.refreshToken },
          }
        );

        const currentUserSnapshot = await fetchJson<CurrentUser>(`${backendUrl}/api/auth/me`, {
          token: tokens.accessToken,
        });

        setSession({
          user: currentUserSnapshot,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });
        setCurrentUser(currentUserSnapshot);
        setNotice({ tone: "success", message: "Session restored from local storage." });
        return;
      }
    }

    const devUser = await fetchJson<CurrentUser>(`${backendUrl}/api/auth/me`);
    setCurrentUser(devUser);
    setNotice({ tone: "info", message: "Development auth bypass detected." });
  }, [backendUrl]);

  useEffect(() => {
    const controller = new AbortController();

    const bootstrap = async () => {
      setIsBootstrapping(true);

      try {
        const healthSnapshot = await fetchJson<HealthResponse>(`${backendUrl}/health`, {
          signal: controller.signal,
        });

        setHealth(healthSnapshot);
        await bootstrapCurrentUser();
      } catch {
        setNotice({ tone: "warning", message: "Backend unreachable or no active session found." });
      } finally {
        setIsBootstrapping(false);
      }
    };

    void bootstrap();

    return () => controller.abort();
  }, [backendUrl, bootstrapCurrentUser]);

  useEffect(() => {
    void reloadGroups();
  }, [reloadGroups]);

  const login = useCallback(
    async ({ email, password, rememberMe }: LoginInput) => {
      const result = await loginUser(backendUrl, { email, password, rememberMe });

      setSession(result);
      setCurrentUser(result.user);
      setNotice({ tone: "success", message: `Signed in as ${result.user.email}.` });
    },
    [backendUrl]
  );

  const register = useCallback(
    async ({ email, name, password }: RegisterInput) => {
      const result = await registerUser(backendUrl, { email, name, password });

      setSession({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
      setCurrentUser(result.user);
      setNotice({ tone: "success", message: `Registered and signed in as ${result.user.email}.` });

      return {
        message: result.message || `Registered and signed in as ${result.user.email}.`,
        email: result.user.email,
      };
    },
    [backendUrl]
  );

  const refreshSession = useCallback(async () => {
    if (!session?.refreshToken) {
      throw new Error("No refresh token is stored yet.");
    }

    const tokens = await fetchJson<Pick<AuthSession, "accessToken" | "refreshToken">>(
      `${backendUrl}/api/auth/refresh`,
      {
        method: "POST",
        json: { refreshToken: session.refreshToken },
      }
    );

    const currentUserSnapshot = await fetchJson<CurrentUser>(`${backendUrl}/api/auth/me`, {
      token: tokens.accessToken,
    });

    setSession({
      user: currentUserSnapshot,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
    setCurrentUser(currentUserSnapshot);
    setNotice({ tone: "success", message: "Session refreshed." });
  }, [backendUrl, session?.refreshToken]);

  useEffect(() => {
    if (!session?.refreshToken) {
      return;
    }

    const refreshIntervalMs = 12 * 60 * 1000;
    const intervalId = setInterval(() => {
      void refreshSession().catch(() => {
        void 0;
      });
    }, refreshIntervalMs);

    return () => clearInterval(intervalId);
  }, [session?.refreshToken, refreshSession]);

  const logout = useCallback(async () => {
    if (session?.accessToken) {
      try {
        await fetchJson<{ message: string }>(`${backendUrl}/api/auth/logout`, {
          method: "POST",
          token: session.accessToken,
        });
      } catch {
        void 0;
      }
    }

    setCurrentUser(null);
    setSession(null);
    setNotice({ tone: "info", message: "Session cleared from the browser." });
  }, [backendUrl, session?.accessToken]);

  const deleteCurrentUser = useCallback(async () => {
    await deleteCurrentUserRequest(backendUrl, session?.accessToken);

    setCurrentUser(null);
    setSession(null);
    saveSession(null);
    setNotice({ tone: "success", message: "Account deleted successfully." });
  }, [backendUrl, session?.accessToken]);

  const probeDevSession = useCallback(
    async (token?: string) => {
      const currentUserSnapshot = await fetchJson<CurrentUser>(`${backendUrl}/api/auth/me`, {
        token,
      });

      setCurrentUser(currentUserSnapshot);
      setSession((current) => {
        if (!token) {
          return current;
        }

        return {
          user: currentUserSnapshot,
          accessToken: token,
          refreshToken: current?.refreshToken ?? "",
        };
      });
      setNotice({ tone: "success", message: "Dev session connected." });
    },
    [backendUrl]
  );

  const reloadAdminState = useCallback(async () => {
    const [state, routes, jobs] = await Promise.all([
      fetchJson<BackendState>(`${backendUrl}/api/redis/state`, {
        token: session?.accessToken,
      }),
      fetchJson<RegisteredRoute[]>(`${backendUrl}/api/redis/routes`, {
        token: session?.accessToken,
      }),
      fetchJson<RegisteredJob[]>(`${backendUrl}/api/redis/jobs`, {
        token: session?.accessToken,
      }),
    ]);

    setAdmin({
      state,
      routes,
      jobs,
      loadedAt: new Date().toISOString(),
    });
  }, [backendUrl, session?.accessToken]);

  const updateCurrentUser = useCallback((patch: Partial<CurrentUser>) => {
    setCurrentUser((current) => (current ? { ...current, ...patch } : current));
    setSession((current) => (current ? { ...current, user: { ...current.user, ...patch } } : current));
  }, []);

  const clearSession = useCallback(() => {
    setCurrentUser(null);
    setSession(null);
    saveSession(null);
    setNotice({ tone: "info", message: "Local session removed." });
  }, []);

  const setApiBaseUrl = useCallback((nextValue: string) => setApiBaseUrlState(normalizeBaseUrl(nextValue)), []);

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
      admin,
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
      admin,
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