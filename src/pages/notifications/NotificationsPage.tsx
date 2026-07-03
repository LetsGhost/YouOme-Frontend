import { Bell, Trash2, CheckCircle2, AlertTriangle, Users, UserPlus, Archive } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Alert,
  Skeleton,
  Tooltip,
  CircularProgress,
} from "@mui/material";

import { useAppState } from "../../app/AppStateContext";
import {
  clearNotifications,
  deleteNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  respondToGroupInvite,
  respondToFriendInvite,
} from "../../shared/api/backend";
import { formatTimestamp } from "../../shared/lib/format";

type NotificationItem = {
  id: string;
  type: "invite" | "payment" | "expense" | "group" | "friend-request" | "group-invite";
  message: string;
  time: string;
  read: boolean;
  icon: typeof Users;
  actionType?: "friend-request" | "group-invite";
  inviteId?: string;
  fromUserName?: string;
  fromUserEmail?: string;
  groupId?: string;
  groupName?: string;
  notificationId?: string;
};

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function formatNotificationTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || "Recently";
  }

  return formatTimestamp(value);
}

const microLabelSx = {
  fontFamily: "var(--font-mono)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  fontSize: "10.5px",
  color: "var(--color-muted)",
} as const;

export function NotificationsPage() {
  const navigate = useNavigate();
  const { backendUrl, session, setNotice, reloadGroups } = useAppState();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingNotificationId, setPendingNotificationId] = useState<string | null>(null);
  const [isBulkActionPending, setIsBulkActionPending] = useState(false);

  const loadNotifications = async () => {
    if (!session?.accessToken) {
      setNotifications([]);
      setIsLoading(false);
      setErrorMessage("Sign in to view notifications.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const items = await listNotifications(backendUrl, session.accessToken);

      setNotifications(
        items.map((notification) => {
          const payload = notification.payload && typeof notification.payload === "object" ? notification.payload : {};
          const inviteId = readString(payload.inviteId);
          const paymentExpenseTitle = readString(payload.title) || "an expense";
          const isFriendRequest = notification.type === "friend.request" && Boolean(inviteId);
          const isGroupInvite = notification.type === "group.invite" && Boolean(inviteId);
          const isPaymentEvent = notification.type.startsWith("expense.payment");
          const isAnnouncement = notification.type === "system.announcement";

          return {
            id: notification._id,
            notificationId: notification._id,
            type: isFriendRequest
              ? "friend-request"
              : isGroupInvite
                ? "group-invite"
                : notification.type === "group.created"
                  ? "group"
                  : isPaymentEvent
                    ? "payment"
                    : "expense",
            message: isFriendRequest
              ? `Friend request from ${readString(payload.fromUserName) || readString(payload.fromUserEmail) || "someone"}`
              : isGroupInvite
                ? `${readString(payload.invitedByUserName) || "Someone"} invited you to ${readString(payload.groupName) || "a group"}`
                : notification.type === "group.created"
                  ? `You can now access ${readString(payload.name) || "your new group"}`
                  : notification.type === "expense.payment_due"
                    ? `${paymentExpenseTitle} is waiting for your payment in ${readString(payload.groupName) || "a group"}`
                    : notification.type === "expense.payment_submitted"
                      ? `${readString(payload.userName) || "A member"} submitted payment for ${paymentExpenseTitle}`
                      : notification.type === "expense.payment_rejected"
                        ? `Your payment for ${paymentExpenseTitle} was rejected`
                        : notification.type === "expense.payment_confirmed"
                          ? `Your payment for ${paymentExpenseTitle} was approved`
                          : isAnnouncement
                            ? `${readString(payload.title) || "Announcement"}: ${readString(payload.message) || ""}`
                            : `Notification type: ${notification.type}`,
            time: notification.createdAt || notification.updatedAt || "Recently",
            read: Boolean(notification.readAt),
            icon: isFriendRequest || isGroupInvite || notification.type === "group.created" ? Users : isPaymentEvent ? CheckCircle2 : AlertTriangle,
            actionType: isFriendRequest ? "friend-request" : isGroupInvite ? "group-invite" : undefined,
            inviteId: isFriendRequest || isGroupInvite ? inviteId : undefined,
            groupId: isGroupInvite || isPaymentEvent ? readString(payload.groupId) : undefined,
            groupName: isGroupInvite || isPaymentEvent ? readString(payload.groupName) : undefined,
            fromUserName: readString(payload.fromUserName),
            fromUserEmail: readString(payload.fromUserEmail),
          } satisfies NotificationItem;
        })
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load notifications.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, [backendUrl, session?.accessToken]);

  const totalCount = notifications.length;
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const readCount = totalCount - unreadCount;

  const handleMarkAsRead = async (notification: NotificationItem) => {
    if (!session?.accessToken || notification.read) {
      return;
    }

    setErrorMessage(null);
    setPendingNotificationId(notification.id);

    try {
      await markNotificationRead(backendUrl, notification.id, session.accessToken);
      setNotifications((prev) => prev.map((item) => (item.id === notification.id ? { ...item, read: true } : item)));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to mark notification as seen.");
    } finally {
      setPendingNotificationId(null);
    }
  };

  const handleDelete = async (notification: NotificationItem) => {
    if (!session?.accessToken) {
      return;
    }

    setErrorMessage(null);
    setPendingNotificationId(notification.id);

    try {
      await deleteNotification(backendUrl, notification.id, session.accessToken);
      setNotifications((prev) => prev.filter((item) => item.id !== notification.id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to clear notification.");
    } finally {
      setPendingNotificationId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!session?.accessToken || unreadCount === 0) {
      return;
    }

    setErrorMessage(null);
    setIsBulkActionPending(true);

    try {
      await markAllNotificationsRead(backendUrl, session.accessToken);
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to mark all notifications as seen.");
    } finally {
      setIsBulkActionPending(false);
    }
  };

  const handleClearAll = async () => {
    if (!session?.accessToken || totalCount === 0) {
      return;
    }

    setErrorMessage(null);
    setIsBulkActionPending(true);

    try {
      await clearNotifications(backendUrl, session.accessToken);
      setNotifications([]);
      setNotice({ tone: "info", message: "Notifications cleared." });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to clear notifications.");
    } finally {
      setIsBulkActionPending(false);
    }
  };

  const handleFriendAction = async (notification: NotificationItem, accept: boolean) => {
    if (!notification.inviteId || !session?.accessToken) {
      return;
    }

    setErrorMessage(null);

    try {
      await respondToFriendInvite(backendUrl, notification.inviteId, accept, session.accessToken);
      await markNotificationRead(backendUrl, notification.id, session.accessToken);
      setNotifications((prev) => prev.filter((item) => item.id !== notification.id));
      setNotice({
        tone: accept ? "success" : "info",
        message: accept ? "Friend request accepted." : "Friend request rejected.",
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update friend request.");
    }
  };

  const handleGroupInviteAction = async (notification: NotificationItem, accept: boolean) => {
    if (!notification.inviteId || !session?.accessToken) {
      return;
    }

    setErrorMessage(null);

    try {
      await respondToGroupInvite(backendUrl, notification.inviteId, { accept }, session.accessToken);
      await markNotificationRead(backendUrl, notification.id, session.accessToken);
      await reloadGroups();
      setNotifications((prev) => prev.filter((item) => item.id !== notification.id));
      setNotice({
        tone: accept ? "success" : "info",
        message: accept ? "Group invite accepted." : "Group invite rejected.",
      });

      if (accept && notification.groupId) {
        navigate(`/groups/${notification.groupId}`);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update group invite.");
    }
  };

  const sectionSummary = useMemo(
    () => [
      { label: "Total", value: totalCount, tone: "neutral" as const },
      { label: "Unread", value: unreadCount, tone: "warning" as const },
      { label: "Seen", value: readCount, tone: "neutral" as const },
    ],
    [readCount, totalCount, unreadCount]
  );

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1080px",
        mx: "auto",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        bgcolor: "var(--color-surface)",
        boxShadow: "var(--shadow-md)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {errorMessage && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              flexShrink: 0,
              borderRadius: "var(--radius-sm)",
              display: "grid",
              placeItems: "center",
              bgcolor: "var(--color-accent-soft-bg)",
              color: "var(--color-accent-soft-ink)",
            }}
          >
            <Bell size={22} strokeWidth={2} />
          </Box>
          <Box>
            <Typography sx={{ ...microLabelSx, mb: 0.25 }}>Activity stream</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: "1.3rem", md: "1.5rem" }, color: "var(--color-ink)" }}>
              Notifications
            </Typography>
          </Box>
        </Box>

        {/* Stat row */}
        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            mb: 2.5,
          }}
        >
          {sectionSummary.map((item) => {
            const isWarning = item.tone === "warning";
            return (
              <Box
                key={item.label}
                sx={{
                  borderRadius: "var(--radius-sm)",
                  border: `1px solid ${isWarning ? "var(--color-warning-border)" : "var(--color-border)"}`,
                  bgcolor: isWarning ? "var(--color-warning-soft-bg)" : "transparent",
                  p: { xs: 1.5, md: 2 },
                }}
              >
                <Typography sx={{ ...microLabelSx, color: isWarning ? "var(--color-warning)" : "var(--color-muted)", mb: 0.5 }}>
                  {item.label}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    fontSize: { xs: "1.1rem", md: "1.3rem" },
                    color: isWarning ? "var(--color-warning)" : "var(--color-ink)",
                  }}
                >
                  {item.value}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 1.5, flexDirection: { xs: "column", sm: "row" } }}>
          <Button
            variant="contained"
            onClick={() => void handleMarkAllAsRead()}
            disabled={!session?.accessToken || unreadCount === 0 || isBulkActionPending}
            startIcon={isBulkActionPending && unreadCount > 0 ? undefined : <CheckCircle2 size={16} strokeWidth={2.2} />}
            sx={{
              bgcolor: "var(--color-accent)",
              color: "var(--color-accent-contrast)",
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "var(--radius-sm)",
              px: 2,
              boxShadow: "none",
              "&:hover": { bgcolor: "var(--color-accent)", boxShadow: "none", opacity: 0.9 },
              "&.Mui-disabled": { opacity: 0.5, color: "var(--color-accent-contrast)" },
            }}
          >
            {isBulkActionPending && unreadCount > 0 ? "Marking..." : "Mark all seen"}
          </Button>
          <Button
            variant="outlined"
            onClick={() => void handleClearAll()}
            disabled={!session?.accessToken || totalCount === 0 || isBulkActionPending}
            startIcon={<Trash2 size={16} strokeWidth={2.2} />}
            sx={{
              borderColor: "var(--color-danger-border)",
              color: "var(--color-danger)",
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "var(--radius-sm)",
              px: 2,
              "&:hover": {
                borderColor: "var(--color-danger)",
                backgroundColor: "var(--color-danger-soft-bg)",
              },
              "&.Mui-disabled": { opacity: 0.5 },
            }}
          >
            Clear all
          </Button>
        </Box>
      </Box>

      {/* Notifications List */}
      <Box sx={{ p: { xs: 1.5, md: 2 } }}>
        {isLoading ? (
          <Box sx={{ display: "grid", gap: 1 }}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Box
                key={index}
                sx={{ borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", p: 2 }}
              >
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Skeleton variant="circular" width={36} height={36} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="58%" />
                    <Skeleton width="34%" />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        ) : notifications.length > 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {notifications.map((notification) => {
              const Icon = notification.icon;
              const isUnread = !notification.read;
              const chipColor = isUnread
                ? "var(--color-warning)"
                : notification.type === "payment"
                  ? "var(--color-success)"
                  : "var(--color-accent-soft-ink)";
              const chipBg = isUnread
                ? "var(--color-warning-soft-bg)"
                : notification.type === "payment"
                  ? "var(--color-success-soft-bg)"
                  : "var(--color-accent-soft-bg)";

              return (
                <Box
                  key={notification.id}
                  sx={{
                    borderRadius: "var(--radius-md)",
                    border: `1px solid ${isUnread ? "var(--color-warning-border)" : "var(--color-border)"}`,
                    bgcolor: isUnread ? "var(--color-warning-soft-bg)" : "var(--color-surface-2)",
                    p: { xs: 1.5, md: 2 },
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "flex-start" }}>
                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          flexShrink: 0,
                          borderRadius: "var(--radius-sm)",
                          display: "grid",
                          placeItems: "center",
                          bgcolor: chipBg,
                          color: chipColor,
                        }}
                      >
                        <Icon size={18} strokeWidth={2} />
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0, pt: 0.25 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isUnread ? 700 : 500,
                            color: "var(--color-ink)",
                            lineHeight: 1.45,
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography sx={{ ...microLabelSx, mt: 0.5 }}>
                          {formatNotificationTime(notification.time)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", flexShrink: 0 }}>
                      {notification.actionType === "friend-request" && notification.inviteId && (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<UserPlus size={14} strokeWidth={2.2} />}
                            onClick={() => void handleFriendAction(notification, true)}
                            disabled={pendingNotificationId === notification.id}
                            sx={{
                              textTransform: "none",
                              borderRadius: "var(--radius-sm)",
                              borderColor: "var(--color-border-strong)",
                              color: "var(--color-ink)",
                            }}
                          >
                            Accept
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => void handleFriendAction(notification, false)}
                            disabled={pendingNotificationId === notification.id}
                            sx={{
                              textTransform: "none",
                              borderRadius: "var(--radius-sm)",
                              borderColor: "var(--color-danger-border)",
                              color: "var(--color-danger)",
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {notification.actionType === "group-invite" && notification.inviteId && (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<UserPlus size={14} strokeWidth={2.2} />}
                            onClick={() => void handleGroupInviteAction(notification, true)}
                            disabled={pendingNotificationId === notification.id}
                            sx={{
                              textTransform: "none",
                              borderRadius: "var(--radius-sm)",
                              borderColor: "var(--color-border-strong)",
                              color: "var(--color-ink)",
                            }}
                          >
                            Accept
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => void handleGroupInviteAction(notification, false)}
                            disabled={pendingNotificationId === notification.id}
                            sx={{
                              textTransform: "none",
                              borderRadius: "var(--radius-sm)",
                              borderColor: "var(--color-danger-border)",
                              color: "var(--color-danger)",
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {isUnread && (
                        <Tooltip title="Mark as seen">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => void handleMarkAsRead(notification)}
                              disabled={pendingNotificationId === notification.id}
                              sx={{
                                color: "var(--color-accent)",
                                "&:hover": { bgcolor: "var(--color-accent-soft-bg)" },
                              }}
                            >
                              {pendingNotificationId === notification.id ? (
                                <CircularProgress size={16} thickness={6} color="inherit" />
                              ) : (
                                <CheckCircle2 size={18} strokeWidth={2} />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                      <Tooltip title="Clear notification">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => void handleDelete(notification)}
                            disabled={pendingNotificationId === notification.id}
                            sx={{
                              color: "var(--color-danger)",
                              "&:hover": { bgcolor: "var(--color-danger-soft-bg)" },
                            }}
                          >
                            {pendingNotificationId === notification.id ? (
                              <CircularProgress size={16} thickness={6} color="inherit" />
                            ) : (
                              <Archive size={18} strokeWidth={2} />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: { xs: 5, md: 7 },
              px: 3,
              borderRadius: "var(--radius-md)",
              border: "1px dashed var(--color-border)",
            }}
          >
            <Bell size={56} strokeWidth={1.8} color="var(--color-muted-3)" style={{ marginBottom: 16 }} />
            <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--color-ink)", mb: 1 }}>
              No notifications right now
            </Typography>
            <Typography sx={{ color: "var(--color-ink-soft)", maxWidth: 520, mx: "auto" }}>
              You are caught up. New invites, expense updates, and confirmations will show up here as they arrive.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
