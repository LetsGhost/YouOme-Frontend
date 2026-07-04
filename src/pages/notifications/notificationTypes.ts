import { Users } from "lucide-react";

import { formatTimestamp } from "../../shared/lib/format";

export type NotificationItem = {
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

export function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function formatNotificationTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || "Recently";
  }

  return formatTimestamp(value);
}
