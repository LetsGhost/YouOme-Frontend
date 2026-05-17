import NotificationsIcon from "@mui/icons-material/Notifications";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import PeopleIcon from "@mui/icons-material/People";
import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Avatar,
  Button,
} from "@mui/material";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      type: "invite",
      message: "Sarah added you to the group Weekend Trip",
      time: "5 minutes ago",
      read: false,
      icon: PeopleIcon,
    },
    {
      id: "2",
      type: "payment",
      message: "John settled a payment of €65.50 with you",
      time: "1 hour ago",
      read: false,
      icon: CheckCircleIcon,
    },
    {
      id: "3",
      type: "expense",
      message: "Emma added an expense in Apartment Expenses",
      time: "3 hours ago",
      read: true,
      icon: WarningIcon,
    },
    {
      id: "4",
      type: "invite",
      message: "Mike added you to the group Dinner Nights",
      time: "Yesterday",
      read: true,
      icon: PeopleIcon,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
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

      {/* Notifications List */}
      {notifications.length > 0 ? (
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