import { emitSessionExpired } from "./sessionEvents";

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
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt?: string;
};

export type GroupMember = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  avatarUrl?: string | null;
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
  includeInNextSettlement?: boolean;
  settlementLockedAt?: string | null;
};

export type GroupDebtParticipant = {
  id: string;
  userId: string;
  name: string;
  email?: string;
  avatarUrl?: string | null;
  shareAmount: number;
  status: "pending" | "payment-submitted" | "payment-confirmed" | string;
  submissionCount: number;
  submittedAt?: string;
  confirmedAt?: string;
  paidAt?: string;
  comment?: string;
  isCurrentUser: boolean;
};

export type GroupDebtExpense = {
  id: string;
  groupId: string;
  createdByUserId: string;
  title: string;
  description: string;
  totalAmount: number;
  paidByUserId: string;
  paidByName: string;
  status: string;
  splitType?: string;
  createdAt?: string;
  date: string;
  participants: GroupDebtParticipant[];
};

export type GroupDebtBoard = {
  groupId: string;
  groupName: string;
  creatorId: string;
  currentUserId: string;
  expenses: GroupDebtExpense[];
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
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PaginatedGroupExpenses = {
  items: GroupExpense[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type GroupPolicy = {
  _id: string;
  groupId: string;
  canMembersInvite: boolean;
  canEditorsAddExpense: boolean;
  canModeratorsAddExpense: boolean;
  visibilityMode: string;
  canViewParticipatedExpenseDetails: boolean;
  requireReceiverConfirmationForSettlement: boolean;
  allowMemberRoleSelfLeave: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type GroupPolicyFields = {
  canMembersInvite?: boolean;
  canEditorsAddExpense?: boolean;
  canModeratorsAddExpense?: boolean;
  visibilityMode?: string;
  canViewParticipatedExpenseDetails?: boolean;
  requireReceiverConfirmationForSettlement?: boolean;
  allowMemberRoleSelfLeave?: boolean;
};

export type CreateGroupPolicyInput = GroupPolicyFields & {
  groupId: string;
};

export type UpdateGroupPolicyInput = GroupPolicyFields;

export type SettlementSchedule = {
  _id: string;
  groupId: string;
  frequency: "weekly" | "monthly" | "quarterly";
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  graceDays: number;
  sendReminder: boolean;
  autoApproveAfterDays: number;
  autoApproveEnabled: boolean;
  isActive: boolean;
  nextRunAt?: string;
  lastRunAt?: string;
};

export type UpsertSettlementScheduleInput = {
  frequency: "weekly" | "monthly" | "quarterly";
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  graceDays?: number;
  sendReminder?: boolean;
  autoApproveAfterDays?: number;
  autoApproveEnabled?: boolean;
};

export type SettlementExpenseDetail = {
  expenseId: string;
  title: string;
  totalAmount: number;
  expenseStatus: string;
  participantStatus: "pending" | "payment-submitted" | "payment-confirmed" | string;
  shareAmount: number;
};

export type Settlement = {
  _id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  settledAmount?: number;
  status: "pending" | "completed" | "expired";
  runId?: string;
  expenseIds: string[];
  expenses?: SettlementExpenseDetail[];
  completedAt?: string;
  createdAt?: string;
};

export type SettlementRunSummary = {
  totalAmount: number;
  participantCount: number;
  confirmedCount: number;
  totalCount: number;
};

export type SettlementRun = {
  _id: string;
  groupId: string;
  triggeredBy: "scheduled" | "manual";
  triggeredByUserId?: string;
  status: "open" | "partially_completed" | "completed";
  graceDeadlineAt: string;
  closedAt?: string;
  createdAt?: string;
  summary?: SettlementRunSummary;
};

export type SettlementsForGroup = {
  outgoing: Settlement[];
  incoming: Settlement[];
  waiting: Settlement[];
};

export type FriendSummary = {
  id: string;
  name: string;
  email: string;
  blocked: boolean;
  avatarUrl?: string | null;
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

export type BroadcastNotificationInput = {
  title: string;
  message: string;
};

export type BroadcastNotificationResponse = {
  count: number;
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
  includeInNextSettlement?: boolean;
  participants?: ExpenseParticipantInput[];
};

export type AuthSession = {
  user: CurrentUser;
  accessToken: string;
  refreshToken: string;
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

export type RegisterResponse = {
  message: string;
  user: CurrentUser;
  accessToken: string;
  refreshToken: string;
};

export type UpdateProfileInput = {
  name?: string;
  email?: string;
  bio?: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
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
  changelogVersion: "youome.changelog.seenVersion",
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

export function getSeenChangelogVersion() {
  return localStorage.getItem(STORAGE_KEYS.changelogVersion);
}

export function setSeenChangelogVersion(version: string) {
  localStorage.setItem(STORAGE_KEYS.changelogVersion, version);
}

export function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.trim().replace(/\/+$/, "");
}

export async function login(backendUrl: string, input: LoginInput) {
  return fetchJson<AuthSession>(`${backendUrl}/api/auth/login`, {
    method: "POST",
    json: input,
  });
}

export async function register(backendUrl: string, input: RegisterInput) {
  return fetchJson<RegisterResponse>(`${backendUrl}/api/auth/register`, {
    method: "POST",
    json: input,
  });
}

export async function deleteCurrentUser(backendUrl: string, token?: string) {
  return fetchJson<{ message: string }>(`${backendUrl}/api/auth/me`, {
    method: "DELETE",
    token,
  });
}

export async function updateProfile(backendUrl: string, input: UpdateProfileInput, token?: string) {
  return fetchJson<CurrentUser>(`${backendUrl}/api/auth/me`, {
    method: "PATCH",
    json: input,
    token,
  });
}

export async function changePassword(backendUrl: string, input: ChangePasswordInput, token?: string) {
  return fetchJson<{ message: string }>(`${backendUrl}/api/auth/me/password`, {
    method: "POST",
    json: input,
    token,
  });
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

export async function getUserById(backendUrl: string, userId: string, token?: string) {
  return fetchJson<CurrentUser>(`${backendUrl}/api/users/${userId}`, {
    token,
  });
}

export async function getFriendshipStatus(backendUrl: string, otherUserId: string, token?: string) {
  return fetchJson<{ isFriend: boolean; isBlocked: boolean }>(
    `${backendUrl}/api/friend-lists/status/${otherUserId}`,
    { token }
  );
}

export async function removeFriend(backendUrl: string, friendUserId: string, token?: string) {
  return fetchJson<{ friendUserIds: Array<{ friendUserId: string; blocked: boolean }> }>(
    `${backendUrl}/api/friend-lists/${friendUserId}`,
    { method: "DELETE", token }
  );
}

export async function listGroupMembers(backendUrl: string, groupId: string, token?: string) {
  return fetchJson<GroupMember[]>(`${backendUrl}/api/group-members/group/${groupId}`, {
    token,
  });
}

export async function getGroupPolicy(backendUrl: string, groupId: string, token?: string) {
  return fetchJson<GroupPolicy>(`${backendUrl}/api/group-policys/group/${groupId}`, {
    token,
  });
}

export async function createGroupPolicy(
  backendUrl: string,
  input: CreateGroupPolicyInput,
  token?: string
) {
  return fetchJson<GroupPolicy>(`${backendUrl}/api/group-policys`, {
    method: "POST",
    json: input,
    token,
  });
}

export async function updateGroupPolicy(
  backendUrl: string,
  groupId: string,
  input: UpdateGroupPolicyInput,
  token?: string
) {
  return fetchJson<GroupPolicy>(`${backendUrl}/api/group-policys/group/${groupId}`, {
    method: "PATCH",
    json: input,
    token,
  });
}

export async function getSettlementSchedule(backendUrl: string, groupId: string, token?: string) {
  return fetchJson<SettlementSchedule | null>(`${backendUrl}/api/settlement-schedules/group/${groupId}`, {
    token,
  });
}

export async function saveSettlementSchedule(
  backendUrl: string,
  groupId: string,
  input: UpsertSettlementScheduleInput,
  token?: string
) {
  return fetchJson<SettlementSchedule>(`${backendUrl}/api/settlement-schedules/group/${groupId}`, {
    method: "PATCH",
    json: input,
    token,
  });
}

export async function deactivateSettlementSchedule(backendUrl: string, groupId: string, token?: string) {
  return fetchJson<SettlementSchedule>(`${backendUrl}/api/settlement-schedules/group/${groupId}/deactivate`, {
    method: "POST",
    token,
  });
}

export async function getSettlementsForGroup(backendUrl: string, groupId: string, token?: string) {
  return fetchJson<SettlementsForGroup>(`${backendUrl}/api/settlements/group/${groupId}`, {
    token,
  });
}

export async function getSettlementHistory(backendUrl: string, groupId: string, token?: string) {
  return fetchJson<SettlementRun[]>(`${backendUrl}/api/settlements/group/${groupId}/history`, {
    token,
  });
}

export async function getSettlementRunDetail(backendUrl: string, groupId: string, runId: string, token?: string) {
  return fetchJson<{ run: SettlementRun; settlements: Settlement[] }>(
    `${backendUrl}/api/settlements/group/${groupId}/history/${runId}`,
    { token }
  );
}

export async function triggerSettlement(backendUrl: string, groupId: string, token?: string) {
  return fetchJson<SettlementRun | null>(`${backendUrl}/api/settlements/group/${groupId}/trigger`, {
    method: "POST",
    token,
  });
}

export async function markSettlementPaid(backendUrl: string, settlementId: string, token?: string) {
  return fetchJson<Settlement>(`${backendUrl}/api/settlements/${settlementId}/mark-paid`, {
    method: "POST",
    token,
  });
}

export async function approveSettlement(backendUrl: string, settlementId: string, token?: string) {
  return fetchJson<Settlement>(`${backendUrl}/api/settlements/${settlementId}/approve`, {
    method: "POST",
    token,
  });
}

export async function markAllSettlementsPaid(backendUrl: string, groupId: string, token?: string) {
  return fetchJson<SettlementsForGroup>(`${backendUrl}/api/settlements/group/${groupId}/mark-all-paid`, {
    method: "POST",
    token,
  });
}

export async function approveAllSettlements(backendUrl: string, groupId: string, token?: string) {
  return fetchJson<SettlementsForGroup>(`${backendUrl}/api/settlements/group/${groupId}/approve-all`, {
    method: "POST",
    token,
  });
}

export async function setExpenseIncludeInSettlement(
  backendUrl: string,
  expenseId: string,
  include: boolean,
  token?: string
) {
  return fetchJson<GroupExpense>(`${backendUrl}/api/expenses/${expenseId}/include-in-settlement`, {
    method: "PATCH",
    json: { include },
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

export async function markAllNotificationsRead(backendUrl: string, token?: string) {
  return fetchJson<NotificationRecord[]>(`${backendUrl}/api/notifications/read-all`, {
    method: "PATCH",
    token,
  });
}

export async function deleteNotification(backendUrl: string, notificationId: string, token?: string) {
  return fetchJson<void>(`${backendUrl}/api/notifications/${notificationId}`, {
    method: "DELETE",
    token,
  });
}

export async function clearNotifications(backendUrl: string, token?: string) {
  return fetchJson<void>(`${backendUrl}/api/notifications`, {
    method: "DELETE",
    token,
  });
}

export async function broadcastNotification(
  backendUrl: string,
  input: BroadcastNotificationInput,
  token?: string
) {
  return fetchJson<BroadcastNotificationResponse>(`${backendUrl}/api/notifications/broadcast`, {
    method: "POST",
    json: input,
    token,
  });
}

export async function getGroup(backendUrl: string, groupId: string, token?: string) {
  return fetchJson<Group>(`${backendUrl}/api/groups/${groupId}`, {
    token,
  });
}

export async function getGroupDebtBoard(backendUrl: string, groupId: string, token?: string) {
  return fetchJson<GroupDebtBoard>(`${backendUrl}/api/groups/${groupId}/debts`, {
    token,
  });
}

export async function listGroupExpenses(
  backendUrl: string,
  groupId: string,
  params: { page?: number; limit?: number } = {},
  token?: string
) {
  const query = new URLSearchParams();

  if (params.page) {
    query.set("page", String(params.page));
  }

  if (params.limit) {
    query.set("limit", String(params.limit));
  }

  const queryString = query.toString();

  return fetchJson<PaginatedGroupExpenses>(
    `${backendUrl}/api/groups/${groupId}/expenses${queryString ? `?${queryString}` : ""}`,
    { token }
  );
}

export async function createGroup(backendUrl: string, input: CreateGroupInput, token?: string) {
  return fetchJson<Group>(`${backendUrl}/api/groups`, {
    method: "POST",
    json: input,
    token,
  });
}

export async function deleteGroup(backendUrl: string, groupId: string, token?: string) {
  return fetchJson<{ message: string }>(`${backendUrl}/api/groups/${groupId}`, {
    method: "DELETE",
    token,
  });
}

export async function uploadUserAvatar(backendUrl: string, file: File, token?: string) {
  const formData = new FormData();
  formData.append("avatar", file);

  return fetchJson<CurrentUser>(`${backendUrl}/api/users/me/avatar`, {
    method: "POST",
    body: formData,
    token,
  });
}

export async function deleteUserAvatar(backendUrl: string, token?: string) {
  return fetchJson<CurrentUser>(`${backendUrl}/api/users/me/avatar`, {
    method: "DELETE",
    token,
  });
}

export async function uploadGroupAvatar(backendUrl: string, groupId: string, file: File, token?: string) {
  const formData = new FormData();
  formData.append("avatar", file);

  return fetchJson<Group>(`${backendUrl}/api/groups/${groupId}/avatar`, {
    method: "POST",
    body: formData,
    token,
  });
}

export async function deleteGroupAvatar(backendUrl: string, groupId: string, token?: string) {
  return fetchJson<Group>(`${backendUrl}/api/groups/${groupId}/avatar`, {
    method: "DELETE",
    token,
  });
}

// Avatar routes return a relative path (e.g. "/api/users/<id>/avatar") since
// the backend doesn't know its own public origin. The frontend and backend
// run on different origins (Vite dev server vs. the API), so that path has
// to be resolved against backendUrl before it's usable - passing it through
// as-is silently fetches the frontend's own dev server instead (you'd get
// index.html back instead of image bytes).
export function resolveAvatarUrl(backendUrl: string, avatarUrl?: string | null) {
  return avatarUrl ? `${backendUrl}${avatarUrl}` : null;
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

export type UpdateExpenseInput = {
  title?: string;
  totalAmount?: number;
  note?: string;
};

export async function updateExpense(
  backendUrl: string,
  expenseId: string,
  input: UpdateExpenseInput,
  token?: string
) {
  return fetchJson<GroupExpense>(`${backendUrl}/api/expenses/${expenseId}`, {
    method: "PATCH",
    json: input,
    token,
  });
}

export async function deleteExpense(backendUrl: string, expenseId: string, token?: string) {
  return fetchJson<{ message: string }>(`${backendUrl}/api/expenses/${expenseId}`, {
    method: "DELETE",
    token,
  });
}

export async function confirmExpenseReceipt(backendUrl: string, expenseId: string, token?: string) {
  return fetchJson<GroupExpense>(`${backendUrl}/api/expenses/${expenseId}/confirm-receipt`, {
    method: "POST",
    token,
  });
}

const DEFAULT_TIMEOUT_MS = 15000;

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

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), DEFAULT_TIMEOUT_MS);
  const callerSignal = options.signal;

  if (callerSignal) {
    if (callerSignal.aborted) {
      timeoutController.abort();
    } else {
      callerSignal.addEventListener("abort", () => timeoutController.abort(), { once: true });
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: timeoutController.signal,
      body: options.json === undefined ? options.body : JSON.stringify(options.json),
    });

    const text = await response.text();
    const payload = text ? safeParseJson<ApiError | T>(text) : null;

    if (!response.ok) {
      const apiError = payload as ApiError | null;

      if (response.status === 401) {
        emitSessionExpired();
      }

      throw new Error(apiError?.message || `Request failed with status ${response.status}`);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError" && !callerSignal?.aborted) {
      throw new Error("Request timed out. Check your connection and try again.");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Avatar routes are authenticated like every other endpoint (Bearer token or
// the dev X-Dev-User-Id header) - a plain <img src> can't send those headers,
// so callers fetch the bytes as a Blob and turn them into an object URL
// (see shared/lib/useAuthenticatedImage.ts).
export async function fetchImageBlob(url: string, token?: string, signal?: AbortSignal): Promise<Blob> {
  const headers = new Headers();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    headers.set("X-Dev-User-Id", ensureDevUserId());
  }

  const response = await fetch(url, { headers, signal });

  if (!response.ok) {
    if (response.status === 401) {
      emitSessionExpired();
    }
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.blob();
}

function safeParseJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    throw new Error(`Could not parse backend response: ${message}`);
  }
}