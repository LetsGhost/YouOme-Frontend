import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import {
  AuthSession,
  BackendState,
  CurrentUser,
  DEFAULT_API_BASE_URL,
  HealthResponse,
  RegisteredJob,
  RegisteredRoute,
  fetchJson,
  getApiBaseUrl,
  normalizeBaseUrl,
  readSession,
  saveSession,
  setApiBaseUrl as persistApiBaseUrl,
} from "../shared/api/backend";

export type NotificationTone = "idle" | "success" | "warning" | "error" | "info";

export type Notice = {
  tone: NotificationTone;
  message: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  email: string;
  name: string;
  password: string;
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
  notice: Notice;
  isBootstrapping: boolean;
  admin: AdminBundle;
  setApiBaseUrl: (value: string) => void;
  setNotice: (value: Notice) => void;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
  probeDevSession: (token?: string) => Promise<void>;
  reloadHealth: () => Promise<void>;
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

  const reloadHealth = useCallback(async () => {
    const healthSnapshot = await fetchJson<HealthResponse>(`${backendUrl}/health`);
    setHealth(healthSnapshot);
    return;
  }, [backendUrl]);

  const bootstrapCurrentUser = useCallback(async () => {
    const storedSession = readSession();

    if (storedSession?.accessToken) {
      const currentUserSnapshot = await fetchJson<CurrentUser>(`${backendUrl}/api/auth/me`, {
        token: storedSession.accessToken,
      });

      setSession({ ...storedSession, user: currentUserSnapshot });
      setCurrentUser(currentUserSnapshot);
      setNotice({ tone: "success", message: "Session restored from local storage." });
      return;
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

  const login = useCallback(
    async ({ email, password }: LoginInput) => {
      const result = await fetchJson<AuthSession>(`${backendUrl}/api/authentications/login`, {
        method: "POST",
        json: { email, password },
      });

      setSession(result);
      setCurrentUser(result.user);
      setNotice({ tone: "success", message: `Signed in as ${result.user.email}.` });
    },
    [backendUrl]
  );

  const register = useCallback(
    async ({ email, name, password }: RegisterInput) => {
      type RegisterResponse = Partial<AuthSession> & {
        message?: string;
      };

      const result = await fetchJson<RegisterResponse>(`${backendUrl}/api/auth/register`, {
        method: "POST",
        json: { email, name, password },
      });

      if (result.user && result.accessToken && result.refreshToken) {
        setSession({
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        });
        setCurrentUser(result.user);
        setNotice({ tone: "success", message: `Registered and signed in as ${result.user.email}.` });
        return;
      }

      setNotice({
        tone: "success",
        message: result.message || "Registration submitted. Please sign in.",
      });
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

  const clearSession = useCallback(() => {
    setCurrentUser(null);
    setSession(null);
    saveSession(null);
    setNotice({ tone: "info", message: "Local session removed." });
  }, []);

  const value: AppStateValue = {
    apiBaseUrl,
    backendUrl,
    health,
    session,
    currentUser,
    notice,
    isBootstrapping,
    admin,
    setApiBaseUrl: (value) => setApiBaseUrlState(normalizeBaseUrl(value)),
    setNotice,
    login: async (input) => {
      await login(input);
    },
    register: async (input) => {
      await register(input);
    },
    refreshSession: async () => {
      await refreshSession();
    },
    logout: async () => {
      await logout();
    },
    probeDevSession: async (token?: string) => {
      await probeDevSession(token);
    },
    reloadHealth: async () => {
      await reloadHealth();
    },
    reloadAdminState: async () => {
      await reloadAdminState();
    },
    clearSession,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used inside AppProvider");
  }

  return context;
}