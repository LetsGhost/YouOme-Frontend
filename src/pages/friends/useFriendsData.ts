import { useEffect, useMemo, useState } from "react";

import { useAppState } from "../../app/AppStateContext";
import {
  listFriendSummaries,
  listNotifications,
  markNotificationRead,
  respondToFriendInvite,
  sendFriendInvite,
  type FriendSummary,
  type NotificationRecord,
} from "../../shared/api/backend";
import { getInvitePayload, readString } from "./friendsUtils";

export function useFriendsData() {
  const { backendUrl, session, setNotice } = useAppState();
  const [friends, setFriends] = useState<FriendSummary[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadFriends = async () => {
    if (!session?.accessToken) {
      setIsLoading(false);
      setErrorMessage("Sign in to manage friend requests.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [friendSummaries, noteSummaries] = await Promise.all([
        listFriendSummaries(backendUrl, session.accessToken),
        listNotifications(backendUrl, session.accessToken),
      ]);

      setFriends(friendSummaries);
      setNotifications(noteSummaries);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load friends.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadFriends();
  }, [backendUrl, session?.accessToken]);

  const pendingInvites = useMemo(() => {
    return notifications
      .filter((notification) => notification.type === "friend.request")
      .map((notification) => {
        const payload = getInvitePayload(notification);
        return {
          id: notification._id,
          inviteId: readString(payload.inviteId),
          fromUserName: readString(payload.fromUserName) || readString(payload.fromUserEmail) || "Someone",
          fromUserEmail: readString(payload.fromUserEmail),
          fromUserAvatarUrl: readString(payload.fromUserAvatarUrl),
          createdAt: notification.createdAt || notification.updatedAt || "",
          readAt: notification.readAt,
        };
      })
      .filter((invite) => invite.inviteId && !invite.readAt);
  }, [notifications]);

  const handleSendInvite = async (inviteEmail: string) => {
    const email = inviteEmail.trim();

    if (!email) {
      setErrorMessage("Enter an email address to send a friend request.");
      return;
    }

    if (!session?.accessToken) {
      setErrorMessage("You need to be signed in to send friend requests.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await sendFriendInvite(backendUrl, { toUserEmail: email }, session.accessToken);
      setNotice({ tone: "success", message: `Friend request sent to ${email}.` });
      await loadFriends();
      return true;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to send friend request.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteResponse = async (notificationId: string, inviteId: string, accept: boolean) => {
    if (!session?.accessToken) {
      setErrorMessage("You need to be signed in to respond to requests.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await respondToFriendInvite(backendUrl, inviteId, accept, session.accessToken);
      await markNotificationRead(backendUrl, notificationId, session.accessToken);
      setNotice({
        tone: accept ? "success" : "info",
        message: accept ? "Friend request accepted." : "Friend request rejected.",
      });
      await loadFriends();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update friend request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    backendUrl,
    accessToken: session?.accessToken,
    friends,
    pendingInvites,
    isLoading,
    isSubmitting,
    errorMessage,
    handleSendInvite,
    handleInviteResponse,
  };
}
