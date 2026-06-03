import NotificationsIcon from "@mui/icons-material/Notifications";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  IconButton,
  Avatar,
  Button,
  Alert,
  Divider,
  Skeleton,
  Paper,
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
  type NotificationRecord,
} from "../../shared/api/backend";
import { formatTimestamp } from "../../shared/lib/format";

type NotificationItem = {
  id: string;
  type: "invite" | "payment" | "expense" | "group" | "friend-request" | "group-invite";
  message: string;
  time: string;
  read: boolean;
  icon: typeof PeopleIcon;
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
                          : `Notification type: ${notification.type}`,
            time: notification.createdAt || notification.updatedAt || "Recently",
            read: Boolean(notification.readAt),
            icon: isFriendRequest || isGroupInvite || notification.type === "group.created" ? PeopleIcon : isPaymentEvent ? CheckCircleIcon : WarningIcon,
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
      { label: "Total", value: totalCount, tone: "#1d4ed8" },
      { label: "Unread", value: unreadCount, tone: "#7c3aed" },
      { label: "Seen", value: readCount, tone: "#0f766e" },
    ],
    [readCount, totalCount, unreadCount]
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, position: "relative" }}>
      {errorMessage && <Alert severity="warning">{errorMessage}</Alert>}

      <Paper
        elevation={0}
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 4,
          px: { xs: 2.5, md: 3.5 },
          py: { xs: 2.5, md: 3.5 },
          color: "#f8fafc",
          background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #7c3aed 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.22), transparent 34%), radial-gradient(circle at bottom left, rgba(255,255,255,0.12), transparent 28%)",
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                background: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.18)",
                backdropFilter: "blur(10px)",
              }}
            >
              <NotificationsIcon sx={{ fontSize: 30, color: "#fff" }} />
            </Box>
            <Box>
              <Typography variant="overline" sx={{ letterSpacing: 1.6, opacity: 0.75 }}>
                Activity stream
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                Notifications
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.75, maxWidth: 560, color: "rgba(255,255,255,0.82)" }}>
                Keep tabs on invites, expenses, and updates. Mark items as seen, open actions, or clear the feed when you are done.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ position: "relative", zIndex: 1, display: "flex", gap: 1.5, flexDirection: { xs: "column", sm: "row" } }}>
            <Button
              variant="contained"
              onClick={() => void handleMarkAllAsRead()}
              disabled={!session?.accessToken || unreadCount === 0 || isBulkActionPending}
              sx={{
                bgcolor: "rgba(255,255,255,0.96)",
                color: "#1d4ed8",
                textTransform: "none",
                fontWeight: 700,
                px: 2,
                minWidth: 150,
                "&:hover": { bgcolor: "#fff" },
              }}
            >
              {isBulkActionPending && unreadCount > 0 ? "Marking..." : "Mark all as seen"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => void handleClearAll()}
              disabled={!session?.accessToken || totalCount === 0 || isBulkActionPending}
              sx={{
                borderColor: "rgba(255,255,255,0.3)",
                color: "#fff",
                textTransform: "none",
                fontWeight: 700,
                px: 2,
                minWidth: 126,
                "&:hover": {
                  borderColor: "rgba(255,255,255,0.55)",
                  backgroundColor: "rgba(255,255,255,0.08)",
                },
              }}
            >
              Clear all
            </Button>
          </Box>
        </Box>

        <Box sx={{ position: "relative", zIndex: 1, mt: 3, display: "flex", gap: 1.5, flexDirection: { xs: "column", sm: "row" } }}>
          {sectionSummary.map((item) => (
            <Box
              key={item.label}
              sx={{
                flex: 1,
                p: 2,
                borderRadius: 3,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.14)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography variant="caption" sx={{ display: "block", color: "rgba(255,255,255,0.72)" }}>
                {item.label}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: item.tone }}>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      <Divider sx={{ opacity: 0.45 }} />

      {/* Notifications List */}
      {isLoading ? (
        <Box sx={{ display: "grid", gap: 1.5 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
              <CardContent sx={{ p: 2.25 }}>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="58%" />
                    <Skeleton width="34%" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : notifications.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <Card
                key={notification.id}
                sx={{
                    borderRadius: 3,
                    position: "relative",
                    overflow: "hidden",
                    bgcolor: notification.read ? "#ffffff" : "#f8fbff",
                    border: "1px solid",
                    borderColor: notification.read ? "#e5e7eb" : "#c7d2fe",
                    boxShadow: notification.read ? "0 8px 24px rgba(15, 23, 42, 0.04)" : "0 16px 34px rgba(79, 70, 229, 0.12)",
                    transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: notification.read ? "0 10px 28px rgba(15, 23, 42, 0.06)" : "0 18px 38px rgba(79, 70, 229, 0.16)",
                    },
                }}
              >
                  <Box
                    sx={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      background: notification.read ? "#cbd5e1" : "linear-gradient(180deg, #6366f1 0%, #22c55e 100%)",
                    }}
                  />
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "flex-start" }}>
                      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", flex: 1, minWidth: 0 }}>
                      <Avatar
                        sx={{
                            width: 44,
                            height: 44,
                          bgcolor: notification.read ? "#e5e7eb" : "#e0e7ff",
                            color: notification.read ? "#475569" : "#4338ca",
                          flexShrink: 0,
                        }}
                      >
                        <Icon />
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0, pt: 0.25 }}>
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 0.75, flexWrap: "wrap" }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: notification.read ? 500 : 700,
                                color: notification.read ? "text.secondary" : "text.primary",
                                lineHeight: 1.45,
                              }}
                            >
                              {notification.message}
                            </Typography>
                            <Chip
                              size="small"
                              label={notification.read ? "Seen" : "New"}
                              sx={{
                                height: 22,
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                bgcolor: notification.read ? "#e2e8f0" : "#e0e7ff",
                                color: notification.read ? "#475569" : "#4338ca",
                              }}
                            />
                          </Box>
                        <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mt: 0.5 }}>
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
                            startIcon={<PersonAddIcon />}
                            onClick={() => void handleFriendAction(notification, true)}
                              disabled={pendingNotificationId === notification.id}
                            sx={{ textTransform: "none" }}
                          >
                            Accept
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => void handleFriendAction(notification, false)}
                              disabled={pendingNotificationId === notification.id}
                            sx={{ textTransform: "none" }}
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
                            startIcon={<PersonAddIcon />}
                            onClick={() => void handleGroupInviteAction(notification, true)}
                            disabled={pendingNotificationId === notification.id}
                            sx={{ textTransform: "none" }}
                          >
                            Accept
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => void handleGroupInviteAction(notification, false)}
                            disabled={pendingNotificationId === notification.id}
                            sx={{ textTransform: "none" }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {!notification.read && (
                        <Tooltip title="Mark as seen">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => void handleMarkAsRead(notification)}
                              disabled={pendingNotificationId === notification.id}
                              sx={{
                                color: "#4f46e5",
                                "&:hover": { bgcolor: "#eef2ff" },
                              }}
                            >
                              {pendingNotificationId === notification.id ? (
                                <CircularProgress size={18} thickness={6} color="inherit" />
                              ) : (
                                <CheckCircleIcon sx={{ fontSize: 20 }} />
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
                              color: "#ef4444",
                              "&:hover": { bgcolor: "#fee2e2" },
                            }}
                          >
                            {pendingNotificationId === notification.id ? (
                              <CircularProgress size={18} thickness={6} color="inherit" />
                            ) : (
                              <DeleteIcon sx={{ fontSize: 20 }} />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            textAlign: "center",
            py: { xs: 5, md: 7 },
            px: 3,
            borderRadius: 4,
            border: "1px dashed",
            borderColor: "divider",
            background: "linear-gradient(180deg, rgba(248,250,252,0.9), rgba(255,255,255,0.96))",
          }}
        >
          <NotificationsIcon sx={{ fontSize: 72, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            No notifications right now
          </Typography>
          <Typography sx={{ color: "text.secondary", maxWidth: 520, mx: "auto" }}>
            You are caught up. New invites, expense updates, and confirmations will show up here as they arrive.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}