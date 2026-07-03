import { useEffect, useMemo, useState } from "react";
import { Users, Mail, Search, Send, MessageCircle, Clock, Check, X } from "lucide-react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Button,
  Alert,
  Divider,
  Skeleton,
} from "@mui/material";

import { useAppState } from "../../app/AppStateContext";
import {
  listFriendSummaries,
  listNotifications,
  markNotificationRead,
  resolveAvatarUrl,
  respondToFriendInvite,
  sendFriendInvite,
  type FriendSummary,
  type NotificationRecord,
} from "../../shared/api/backend";
import { formatTimestamp } from "../../shared/lib/format";
import { AvatarUploader } from "../../widgets/avatar/AvatarUploader";

const noop = async () => {
  void 0;
};

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getInvitePayload(notification: NotificationRecord) {
  return notification.payload && typeof notification.payload === "object" ? notification.payload : {};
}

const microLabelSx = {
  fontFamily: "var(--font-mono)",
  fontSize: 10.5,
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  color: "var(--color-muted)",
};

const outlinedFieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "var(--color-surface)",
    "& fieldset": { borderColor: "var(--color-border)" },
    "&:hover fieldset": { borderColor: "var(--color-border-strong)" },
    "&.Mui-focused fieldset": { borderColor: "var(--color-accent)" },
  },
};

export function FriendsPage() {
  const { backendUrl, session, currentUser, setNotice } = useAppState();
  const [searchTerm, setSearchTerm] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
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

  const filteredFriends = friends.filter((friend) =>
    `${friend.name} ${friend.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInvites = pendingInvites.filter((invite) =>
    `${invite.fromUserName} ${invite.fromUserEmail}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendInvite = async () => {
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
      setInviteEmail("");
      setNotice({ tone: "success", message: `Friend request sent to ${email}.` });
      await loadFriends();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to send friend request.");
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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          pb: 3,
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-sm)",
              bgcolor: "var(--color-accent-soft-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Users size={20} color="var(--color-accent-soft-ink)" strokeWidth={2} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.4, color: "var(--color-ink)" }}>
            Friends
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
          Invite people by email, review requests, and keep your friend list in sync.
        </Typography>
      </Box>

      {errorMessage && (
        <Alert
          severity="warning"
          sx={{
            borderRadius: "var(--radius-md)",
            bgcolor: "var(--color-warning-soft-bg)",
            color: "var(--color-warning)",
            border: "1px solid var(--color-warning-border)",
            "& .MuiAlert-icon": { color: "var(--color-warning)" },
          }}
        >
          {errorMessage}
        </Alert>
      )}

      <Card sx={{ bgcolor: "var(--color-surface-2)" }}>
        <CardContent sx={{ display: "grid", gap: 2 }}>
          <Box sx={{ display: "grid", gap: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "var(--color-ink)" }}>
              Send a friend request
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
              Enter the email address the other person used to register.
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gap: 1 }}>
            <Typography sx={microLabelSx}>Friend email</Typography>
            <Box
              sx={{
                display: "grid",
                gap: 1.5,
                gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
                alignItems: "center",
              }}
            >
              <TextField
                fullWidth
                placeholder="friend@example.com"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={18} color="var(--color-muted)" strokeWidth={1.8} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={outlinedFieldSx}
              />

              <Button
                variant="contained"
                onClick={() => void handleSendInvite()}
                disabled={isSubmitting}
                startIcon={<Send size={18} strokeWidth={2} />}
                sx={{
                  minHeight: 56,
                  px: 3,
                  fontWeight: 700,
                  bgcolor: "var(--color-accent)",
                  color: "var(--color-accent-contrast)",
                  "&:hover": { bgcolor: "var(--color-accent)", opacity: 0.9 },
                }}
              >
                Send request
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: "1.2fr 0.8fr" } }}>
        <Card>
          <CardContent sx={{ display: "grid", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Users size={18} color="var(--color-ink)" strokeWidth={2} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "var(--color-ink)" }}>
                    Your friends
                  </Typography>
                  <Typography sx={microLabelSx}>
                    {friends.length} connected
                  </Typography>
                </Box>
              </Box>

              <TextField
                size="small"
                placeholder="Search friends"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={16} color="var(--color-muted)" strokeWidth={1.8} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ minWidth: { xs: 0, sm: 240 }, ...outlinedFieldSx }}
              />
            </Box>

            <Divider sx={{ borderColor: "var(--color-border)" }} />

            {isLoading ? (
              <Box sx={{ display: "grid", gap: 2 }}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="rounded"
                    height={92}
                    sx={{ borderRadius: "var(--radius-md)", bgcolor: "var(--color-surface-2)" }}
                  />
                ))}
              </Box>
            ) : filteredFriends.length > 0 ? (
              <Box sx={{ display: "grid", gap: 2 }}>
                {filteredFriends.map((friend) => (
                  <Card
                    key={friend.id}
                    variant="outlined"
                    sx={{
                      bgcolor: "var(--color-surface-2)",
                      border: `1px solid ${friend.blocked ? "var(--color-warning-border)" : "var(--color-border)"}`,
                      boxShadow: "none",
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flex: 1, minWidth: 0 }}>
                          <AvatarUploader
                            src={resolveAvatarUrl(backendUrl, friend.avatarUrl)}
                            token={session?.accessToken}
                            fallback={friend.name?.[0] || friend.email?.[0] || "?"}
                            size={48}
                            onUpload={noop}
                            onRemove={noop}
                          />

                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "var(--color-ink)" }} noWrap>
                              {friend.name}
                            </Typography>
                            <Typography
                              noWrap
                              sx={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-muted)" }}
                            >
                              {friend.email}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.6,
                              px: 1.2,
                              py: 0.5,
                              borderRadius: "var(--radius-pill)",
                              border: `1px solid ${friend.blocked ? "var(--color-warning-border)" : "var(--color-success-border)"}`,
                              bgcolor: friend.blocked ? "var(--color-warning-soft-bg)" : "var(--color-success-soft-bg)",
                            }}
                          >
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                bgcolor: friend.blocked ? "var(--color-warning)" : "var(--color-success)",
                              }}
                            />
                            <Typography
                              sx={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 10.5,
                                fontWeight: 600,
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                                color: friend.blocked ? "var(--color-warning)" : "var(--color-success)",
                              }}
                            >
                              {friend.blocked ? "Blocked" : "Active"}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Users size={56} strokeWidth={1.6} color="var(--color-muted-3)" style={{ marginBottom: 12 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: "var(--color-ink)" }}>
                  No friends yet
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
                  Send a request by email and accepted users will appear here.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ display: "grid", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Clock size={18} color="var(--color-warning)" strokeWidth={2} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "var(--color-ink)" }}>
                  Pending requests
                </Typography>
                <Typography sx={microLabelSx}>
                  {filteredInvites.length} request{filteredInvites.length === 1 ? "" : "s"} waiting
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ borderColor: "var(--color-border)" }} />

            {filteredInvites.length > 0 ? (
              <Box sx={{ display: "grid", gap: 1.5 }}>
                {filteredInvites.map((invite) => (
                  <Card
                    key={invite.id}
                    variant="outlined"
                    sx={{ bgcolor: "var(--color-surface-2)", border: "1px solid var(--color-border)", boxShadow: "none" }}
                  >
                    <CardContent sx={{ p: 2, display: "grid", gap: 1.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "flex-start" }}>
                        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", minWidth: 0 }}>
                          <AvatarUploader
                            src={resolveAvatarUrl(backendUrl, invite.fromUserAvatarUrl)}
                            token={session?.accessToken}
                            fallback={invite.fromUserName?.[0] || "?"}
                            size={40}
                            onUpload={noop}
                            onRemove={noop}
                          />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "var(--color-ink)" }} noWrap>
                              {invite.fromUserName}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "var(--color-muted)" }} noWrap>
                              {invite.fromUserEmail || "Friend request sent to your account"}
                            </Typography>
                            {invite.createdAt && (
                              <Typography
                                sx={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: 10.5,
                                  color: "var(--color-muted)",
                                  display: "block",
                                  mt: 0.5,
                                }}
                              >
                                {formatTimestamp(invite.createdAt)}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Box
                          sx={{
                            px: 1.2,
                            py: 0.4,
                            borderRadius: "var(--radius-pill)",
                            bgcolor: "var(--color-accent-soft-bg)",
                            color: "var(--color-accent-soft-ink)",
                            fontFamily: "var(--font-mono)",
                            fontSize: 10.5,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            flexShrink: 0,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Request
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                        <Button
                          variant="outlined"
                          onClick={() => void handleInviteResponse(invite.id, invite.inviteId, false)}
                          disabled={isSubmitting}
                          startIcon={<X size={16} strokeWidth={2} />}
                          sx={{
                            borderColor: "var(--color-danger-border)",
                            color: "var(--color-danger)",
                            "&:hover": {
                              borderColor: "var(--color-danger)",
                              bgcolor: "var(--color-danger-soft-bg)",
                            },
                          }}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => void handleInviteResponse(invite.id, invite.inviteId, true)}
                          disabled={isSubmitting}
                          startIcon={<Check size={16} strokeWidth={2} />}
                          sx={{
                            bgcolor: "var(--color-accent)",
                            color: "var(--color-accent-contrast)",
                            "&:hover": { bgcolor: "var(--color-accent)", opacity: 0.9 },
                          }}
                        >
                          Accept
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Clock size={48} strokeWidth={1.6} color="var(--color-muted-3)" style={{ marginBottom: 12 }} />
                <Typography variant="body1" sx={{ fontWeight: 700, color: "var(--color-ink)" }}>
                  No pending requests
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
                  Incoming requests will appear here and in notifications.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
