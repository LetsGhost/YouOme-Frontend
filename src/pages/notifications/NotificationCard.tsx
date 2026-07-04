import { Archive, CheckCircle2, UserPlus } from "lucide-react";
import { Box, Button, CircularProgress, IconButton, Tooltip, Typography } from "@mui/material";

import { formatNotificationTime, NotificationItem } from "./notificationTypes";
import { microLabelSx } from "./notificationsStyles";

export function NotificationCard({
  notification,
  isPending,
  onMarkAsRead,
  onDelete,
  onFriendAction,
  onGroupInviteAction,
}: {
  notification: NotificationItem;
  isPending: boolean;
  onMarkAsRead: (notification: NotificationItem) => void;
  onDelete: (notification: NotificationItem) => void;
  onFriendAction: (notification: NotificationItem, accept: boolean) => void;
  onGroupInviteAction: (notification: NotificationItem, accept: boolean) => void;
}) {
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
                onClick={() => onFriendAction(notification, true)}
                disabled={isPending}
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
                onClick={() => onFriendAction(notification, false)}
                disabled={isPending}
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
                onClick={() => onGroupInviteAction(notification, true)}
                disabled={isPending}
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
                onClick={() => onGroupInviteAction(notification, false)}
                disabled={isPending}
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
                  onClick={() => onMarkAsRead(notification)}
                  disabled={isPending}
                  sx={{
                    color: "var(--color-accent)",
                    "&:hover": { bgcolor: "var(--color-accent-soft-bg)" },
                  }}
                >
                  {isPending ? <CircularProgress size={16} thickness={6} color="inherit" /> : <CheckCircle2 size={18} strokeWidth={2} />}
                </IconButton>
              </span>
            </Tooltip>
          )}
          <Tooltip title="Clear notification">
            <span>
              <IconButton
                size="small"
                onClick={() => onDelete(notification)}
                disabled={isPending}
                sx={{
                  color: "var(--color-danger)",
                  "&:hover": { bgcolor: "var(--color-danger-soft-bg)" },
                }}
              >
                {isPending ? <CircularProgress size={16} thickness={6} color="inherit" /> : <Archive size={18} strokeWidth={2} />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}
