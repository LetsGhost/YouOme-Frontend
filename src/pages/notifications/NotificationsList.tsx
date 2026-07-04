import { Bell } from "lucide-react";
import { Box, Typography } from "@mui/material";

import { LoadingBlock } from "../../shared/ui/InlineSpinner";
import { NotificationItem } from "./notificationTypes";
import { NotificationCard } from "./NotificationCard";

export function NotificationsList({
  isLoading,
  notifications,
  pendingNotificationId,
  onMarkAsRead,
  onDelete,
  onFriendAction,
  onGroupInviteAction,
}: {
  isLoading: boolean;
  notifications: NotificationItem[];
  pendingNotificationId: string | null;
  onMarkAsRead: (notification: NotificationItem) => void;
  onDelete: (notification: NotificationItem) => void;
  onFriendAction: (notification: NotificationItem, accept: boolean) => void;
  onGroupInviteAction: (notification: NotificationItem, accept: boolean) => void;
}) {
  if (isLoading) {
    return <LoadingBlock label="Loading notifications…" minHeight={160} />;
  }

  if (notifications.length > 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            isPending={pendingNotificationId === notification.id}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
            onFriendAction={onFriendAction}
            onGroupInviteAction={onGroupInviteAction}
          />
        ))}
      </Box>
    );
  }

  return (
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
  );
}
