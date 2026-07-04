import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";

import { NotificationsList } from "./NotificationsList";
import { NotificationsSummary } from "./NotificationsSummary";
import { useNotificationsData } from "./useNotificationsData";

export function NotificationsPage() {
  const navigate = useNavigate();
  const {
    notifications,
    isLoading,
    errorMessage,
    pendingNotificationId,
    isBulkActionPending,
    totalCount,
    unreadCount,
    sectionSummary,
    hasAccessToken,
    handleMarkAsRead,
    handleDelete,
    handleMarkAllAsRead,
    handleClearAll,
    handleFriendAction,
    handleGroupInviteAction,
  } = useNotificationsData((groupId) => navigate(`/groups/${groupId}`));

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
      <NotificationsSummary
        errorMessage={errorMessage}
        sectionSummary={sectionSummary}
        hasAccessToken={hasAccessToken}
        unreadCount={unreadCount}
        totalCount={totalCount}
        isBulkActionPending={isBulkActionPending}
        onMarkAllAsRead={() => void handleMarkAllAsRead()}
        onClearAll={() => void handleClearAll()}
      />

      <Box sx={{ p: { xs: 1.5, md: 2 } }}>
        <NotificationsList
          isLoading={isLoading}
          notifications={notifications}
          pendingNotificationId={pendingNotificationId}
          onMarkAsRead={(notification) => void handleMarkAsRead(notification)}
          onDelete={(notification) => void handleDelete(notification)}
          onFriendAction={(notification, accept) => void handleFriendAction(notification, accept)}
          onGroupInviteAction={(notification, accept) => void handleGroupInviteAction(notification, accept)}
        />
      </Box>
    </Box>
  );
}
