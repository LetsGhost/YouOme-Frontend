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
  Typography,
  IconButton,
  Avatar,
  Button,
  Alert,
  Divider,
  Skeleton,
} from "@mui/material";

import { useAppState } from "../../app/AppStateContext";
import {
  listNotifications,
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

export function NotificationsPage() {
  const navigate = useNavigate();
  const { backendUrl, session, setNotice, reloadGroups } = useAppState();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const derivedNotifications = useMemo(() => notifications, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
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

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {errorMessage && <Alert severity="warning">{errorMessage}</Alert>}

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <NotificationsIcon sx={{ fontSize: 40, color: "#4f46e5" }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              Notifications
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : "No unread notifications"}
            </Typography>
          </Box>
        </Box>

        {notifications.length > 0 && (
          <Button
            onClick={handleClearAll}
            sx={{
              color: "text.secondary",
              textTransform: "none",
              fontSize: "0.875rem",
              fontWeight: "bold",
              "&:hover": {
                color: "#ef4444",
              },
            }}
          >
            Clear all
          </Button>
        )}
      </Box>

      <Divider />

      {/* Notifications List */}
      {isLoading ? (
        <Box sx={{ display: "grid", gap: 1.5 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="65%" />
                    <Skeleton width="35%" />
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
                  borderRadius: 2,
                  bgcolor: notification.read ? "#f9fafb" : "#eef2ff",
                  border: `1px solid ${notification.read ? "#e5e7eb" : "#e0e7ff"}`,
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "flex-start" }}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", flex: 1 }}>
                      <Avatar
                        sx={{
                          bgcolor: notification.read ? "#e5e7eb" : "#e0e7ff",
                          color: notification.read ? "#4b5563" : "#4f46e5",
                          flexShrink: 0,
                        }}
                      >
                        <Icon />
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0, pt: 0.25 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: notification.read ? "normal" : "bold",
                            color: notification.read ? "text.secondary" : "text.primary",
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mt: 0.5 }}>
                          {notification.time}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                      {notification.actionType === "friend-request" && notification.inviteId && (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PersonAddIcon />}
                            onClick={() => void handleFriendAction(notification, true)}
                            sx={{ textTransform: "none" }}
                          >
                            Accept
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => void handleFriendAction(notification, false)}
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
                            sx={{ textTransform: "none" }}
                          >
                            Accept
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => void handleGroupInviteAction(notification, false)}
                            sx={{ textTransform: "none" }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {!notification.read && (
                        <IconButton
                          size="small"
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="Mark as read"
                          sx={{
                            color: "#4f46e5",
                            "&:hover": { bgcolor: "#eef2ff" },
                          }}
                        >
                          <CheckCircleIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(notification.id)}
                        title="Delete"
                        sx={{
                          color: "#ef4444",
                          "&:hover": { bgcolor: "#fee2e2" },
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <NotificationsIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
            No notifications
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            You're all caught up! New notifications will appear here.
          </Typography>
        </Box>
      )}
    </Box>
  );
}