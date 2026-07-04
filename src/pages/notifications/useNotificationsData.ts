import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Users } from "lucide-react";

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
import { NotificationItem, readString } from "./notificationTypes";

export function useNotificationsData(onAcceptedGroupInvite: (groupId: string) => void) {
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
        onAcceptedGroupInvite(notification.groupId);
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

  return {
    notifications,
    isLoading,
    errorMessage,
    pendingNotificationId,
    isBulkActionPending,
    totalCount,
    unreadCount,
    sectionSummary,
    hasAccessToken: Boolean(session?.accessToken),
    handleMarkAsRead,
    handleDelete,
    handleMarkAllAsRead,
    handleClearAll,
    handleFriendAction,
    handleGroupInviteAction,
  };
}
