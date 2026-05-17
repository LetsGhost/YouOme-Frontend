export type HealthResponse = {
  status: string;
  timestamp: string;
  uptime: number;
  redis: string;
  environment: string;
};

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type AuthSession = {
  user: CurrentUser;
  accessToken: string;
  refreshToken: string;
};

export type ApiError = {
  message?: string;
};

export type RegisteredRoute = {
  method: string;
  path: string;
  module: string;
};

export type RegisteredJob = {
  name: string;
  schedule: string;
  enabled: boolean;
  running: boolean;
};

export type BackendState = {
  routes: RegisteredRoute[];
  jobs: RegisteredJob[];
  timestamp: string;
  uptime: number;
};

export const STORAGE_KEYS = {
  session: "youome.session",
  apiBaseUrl: "youome.apiBaseUrl",
} as const;

export const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  json?: unknown;
  token?: string;
  body?: BodyInit | null;
};

export function getApiBaseUrl() {
  return localStorage.getItem(STORAGE_KEYS.apiBaseUrl) || DEFAULT_API_BASE_URL;
}

export function setApiBaseUrl(value: string) {
  localStorage.setItem(STORAGE_KEYS.apiBaseUrl, value);
}

export function readSession() {
  const raw = localStorage.getItem(STORAGE_KEYS.session);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession | null) {
  if (!session) {
    localStorage.removeItem(STORAGE_KEYS.session);
    return;
  }

  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
}

export function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.trim().replace(/\/+$/, "");
}

export async function fetchJson<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.json === undefined ? options.body : JSON.stringify(options.json),
  });

  const text = await response.text();
  const payload = text ? safeParseJson<ApiError | T>(text) : null;

  if (!response.ok) {
    const apiError = payload as ApiError | null;
    throw new Error(apiError?.message || `Request failed with status ${response.status}`);
  }

  return payload as T;
}

function safeParseJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    throw new Error(`Could not parse backend response: ${message}`);
  }
}