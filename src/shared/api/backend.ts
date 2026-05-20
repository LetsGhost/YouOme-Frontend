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

export type GroupMember = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
};

export type ExpenseParticipant = {
  id: string;
  expenseId: string;
  userId: string;
  shareAmount: number;
  sharePercent: number;
  status: "pending" | "payment-submitted" | "payment-confirmed";
  submissionCount: number;
  submittedAt?: string;
  confirmedAt?: string;
  comment?: string;
  paidAt?: string;
};

export type GroupExpense = {
  id: string;
  description?: string;
  amount?: number | string;
  paidBy?: string | GroupMember | { id: string; name?: string };
  status?: string;
  createdAt?: string;
  date?: string;
  participants?: Array<string | GroupMember | { id: string; name?: string }>;
  splitType?: "equal" | "custom" | "percentage";
  title?: string;
  totalAmount?: number;
};

export type DebtHistoryEntry = {
  id: string;
  description: string;
  date: string;
  amount: string | number;
  type: "settlement" | "expense";
  participants: string[];
};

export type Group = {
  id: string;
  name: string;
  description?: string | null;
  members?: GroupMember[];
  memberCount?: number;
  totalExpense?: number | string;
  yourShare?: number | string;
  balance?: number | string;
  expenses?: GroupExpense[];
  debtHistory?: DebtHistoryEntry[];
  createdAt?: string;
  updatedAt?: string;
};

export type FriendSummary = {
  id: string;
  name: string;
  email: string;
  blocked: boolean;
};

export type FriendInvite = {
  _id: string;
  fromUserId: string;
  toUserId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt?: string;
  updatedAt?: string;
};

export type GroupInvite = {
  _id: string;
  groupId: string;
  invitedUserId?: string;
  invitedByUserId?: string;
  status: "pending" | "accepted" | "rejected";
  message?: string;
  expiresAt?: string;
  actedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type NotificationRecord = {
  _id: string;
  userId: string;
  type: string;
  payload?: Record<string, unknown>;
  readAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type SendFriendInviteInput = {
  toUserEmail: string;
};

export type CreateGroupInput = {
  name: string;
  description?: string;
};

export type CreateGroupInviteInput = {
  groupId: string;
  invitedUserId: string;
  message?: string;
};

export type RespondToGroupInviteInput = {
  accept: boolean;
};

export type ExpenseParticipantInput = {
  userId: string;
  shareAmount?: number;
  sharePercent?: number;
};

export type CreateExpenseInput = {
  groupId: string;
  createdByUserId: string;
  title: string;
  totalAmount: number;
  paidByUserId?: string;
  splitType?: "equal" | "custom" | "percentage";
  note?: string;
  participants?: ExpenseParticipantInput[];
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
  devUserId: "youome.devUserId",
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

function ensureDevUserId() {
  const existing = localStorage.getItem(STORAGE_KEYS.devUserId);

  if (existing) {
    return existing;
  }

  const generated =
    globalThis.crypto?.randomUUID?.().replace(/-/g, "").slice(0, 24) ??
    `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`.slice(0, 24).padEnd(24, "0");

  localStorage.setItem(STORAGE_KEYS.devUserId, generated);
  return generated;
}

export async function listGroups(backendUrl: string, token?: string) {
  return fetchJson<Group[]>(`${backendUrl}/api/groups`, {
    token,
  });
}

export async function listFriendSummaries(backendUrl: string, token?: string) {
  return fetchJson<FriendSummary[]>(`${backendUrl}/api/friend-lists/summary`, {
    token,
  });
}

export async function listGroupMembers(backendUrl: string, groupId: string, token?: string) {
  return fetchJson<GroupMember[]>(`${backendUrl}/api/group-members/group/${groupId}`, {
    token,
  });
}

export async function sendFriendInvite(
  backendUrl: string,
  input: SendFriendInviteInput,
  token?: string
) {
  return fetchJson<FriendInvite>(`${backendUrl}/api/friend-invites`, {
    method: "POST",
    json: input,
    token,
  });
}

export async function respondToFriendInvite(
  backendUrl: string,
  inviteId: string,
  accept: boolean,
  token?: string
) {
  return fetchJson<FriendInvite>(`${backendUrl}/api/friend-invites/${inviteId}/respond`, {
    method: "PATCH",
    json: { accept },
    token,
  });
}

export async function listNotifications(backendUrl: string, token?: string) {
  return fetchJson<NotificationRecord[]>(`${backendUrl}/api/notifications`, {
    token,
  });
}

export async function markNotificationRead(backendUrl: string, notificationId: string, token?: string) {
  return fetchJson<NotificationRecord>(`${backendUrl}/api/notifications/${notificationId}/read`, {
    method: "PATCH",
    token,
  });
}

export async function getGroup(backendUrl: string, groupId: string, token?: string) {
  return fetchJson<Group>(`${backendUrl}/api/groups/${groupId}`, {
    token,
  });
}

export async function createGroup(backendUrl: string, input: CreateGroupInput, token?: string) {
  return fetchJson<Group>(`${backendUrl}/api/groups`, {
    method: "POST",
    json: input,
    token,
  });
}

export async function createGroupInvite(backendUrl: string, input: CreateGroupInviteInput, token?: string) {
  return fetchJson<GroupInvite>(`${backendUrl}/api/group-invites`, {
    method: "POST",
    json: input,
    token,
  });
}

export async function respondToGroupInvite(
  backendUrl: string,
  inviteId: string,
  input: RespondToGroupInviteInput,
  token?: string
) {
  return fetchJson<GroupInvite>(`${backendUrl}/api/group-invites/${inviteId}/respond`, {
    method: "PATCH",
    json: input,
    token,
  });
}

export async function createExpense(backendUrl: string, input: CreateExpenseInput, token?: string) {
  return fetchJson<GroupExpense>(`${backendUrl}/api/expenses`, {
    method: "POST",
    json: input,
    token,
  });
}

export async function getExpense(backendUrl: string, expenseId: string, token?: string) {
  return fetchJson<{ expense: GroupExpense; participants: ExpenseParticipant[] }>(
    `${backendUrl}/api/expenses/${expenseId}`,
    {
      token,
    }
  );
}

export async function submitExpensePayment(
  backendUrl: string,
  expenseId: string,
  userId: string,
  comment?: string,
  token?: string
) {
  return fetchJson<ExpenseParticipant>(
    `${backendUrl}/api/expenses/${expenseId}/participant/${userId}/submit-payment`,
    {
      method: "POST",
      json: { comment },
      token,
    }
  );
}

export async function rejectExpensePayment(
  backendUrl: string,
  expenseId: string,
  userId: string,
  token?: string
) {
  return fetchJson<ExpenseParticipant>(
    `${backendUrl}/api/expenses/${expenseId}/participant/${userId}/reject-payment`,
    {
      method: "POST",
      token,
    }
  );
}

export async function confirmExpensePayment(
  backendUrl: string,
  expenseId: string,
  userId: string,
  token?: string
) {
  return fetchJson<ExpenseParticipant>(
    `${backendUrl}/api/expenses/${expenseId}/participant/${userId}/confirm-payment`,
    {
      method: "POST",
      token,
    }
  );
}

export async function confirmExpenseReceipt(backendUrl: string, expenseId: string, token?: string) {
  return fetchJson<GroupExpense>(`${backendUrl}/api/expenses/${expenseId}/confirm-receipt`, {
    method: "POST",
    token,
  });
}

export async function fetchJson<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  } else {
    headers.set("X-Dev-User-Id", ensureDevUserId());
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