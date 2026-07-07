import { useCallback, useEffect, useState } from "react";

import {
  AuthSession,
  CurrentUser,
  HealthResponse,
  fetchJson,
  deleteCurrentUser as deleteCurrentUserRequest,
  readSession,
  register as registerUser,
  saveSession,
  login as loginUser,
} from "../../shared/api/backend";
import { onSessionExpired } from "../../shared/api/sessionEvents";

export type NotificationTone = "idle" | "success" | "warning" | "error" | "info";

export type Notice = {
  tone: NotificationTone;
  message: string;
};

export type LoginInput = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type RegisterInput = {
  email: string;
  name: string;
  password: string;
};

export type RegisterResult = {
  message: string;
  email: string;
};

const defaultNotice: Notice = {
  tone: "idle",
  message: "",
};

const LOGIN_SPLASH_DURATION_MS = 2500;

export function useSessionState(backendUrl: string) {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [session, setSession] = useState<AuthSession | null>(() => readSession());
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => readSession()?.user ?? null);
  const [notice, setNotice] = useState<Notice>(defaultNotice);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoginSplashActive, setIsLoginSplashActive] = useState(false);

  useEffect(() => {
    if (!isLoginSplashActive) {
      return;
    }

    const timer = setTimeout(() => setIsLoginSplashActive(false), LOGIN_SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [isLoginSplashActive]);

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

  const login = useCallback(
    async ({ email, password, rememberMe }: LoginInput) => {
      const result = await loginUser(backendUrl, { email, password, rememberMe });

      setSession(result);
      setCurrentUser(result.user);
      setNotice({ tone: "success", message: `Signed in as ${result.user.email}.` });
      setIsLoginSplashActive(true);
    },
    [backendUrl]
  );

  const register = useCallback(
    async ({ email, name, password }: RegisterInput) => {
      const result = await registerUser(backendUrl, { email, name, password });

      setNotice({ tone: "info", message: "Check your email to verify your account before signing in." });

      return {
        message: result.message,
        email: result.email,
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

  return {
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
  };
}
