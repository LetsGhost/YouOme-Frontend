import { useEffect, useMemo, useState } from "react";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ChatIcon from "@mui/icons-material/Chat";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Avatar,
  IconButton,
  Chip,
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
  respondToFriendInvite,
  sendFriendInvite,
  type FriendSummary,
  type NotificationRecord,
} from "../../shared/api/backend";
import { formatTimestamp } from "../../shared/lib/format";

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getInvitePayload(notification: NotificationRecord) {
  return notification.payload && typeof notification.payload === "object" ? notification.payload : {};
}

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
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.4 }}>
          Friends
        </Typography>
        <Typography variant="h6" sx={{ color: "text.secondary" }}>
          Invite people by email, review requests, and keep your friend list in sync.
        </Typography>
      </Box>

      {errorMessage && <Alert severity="warning">{errorMessage}</Alert>}

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ display: "grid", gap: 2 }}>
          <Box sx={{ display: "grid", gap: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Send a friend request
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Enter the email address the other person used to register.
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "1fr auto" }, alignItems: "center" }}>
            <TextField
              fullWidth
              label="Friend email"
              placeholder="friend@example.com"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonAddIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="contained"
              onClick={() => void handleSendInvite()}
              disabled={isSubmitting}
              startIcon={<SendIcon />}
              sx={{ minHeight: 56, px: 3, fontWeight: 700 }}
            >
              Send request
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: "1.2fr 0.8fr" } }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ display: "grid", gap: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Your friends
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {friends.length} connected friend{friends.length === 1 ? "" : "s"}
                </Typography>
              </Box>

              <TextField
                size="small"
                placeholder="Search friends"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: { xs: 0, sm: 280 } }}
              />
            </Box>

            <Divider />

            {isLoading ? (
              <Box sx={{ display: "grid", gap: 2 }}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} variant="rounded" height={92} />
                ))}
              </Box>
            ) : filteredFriends.length > 0 ? (
              <Box sx={{ display: "grid", gap: 2 }}>
                {filteredFriends.map((friend) => (
                  <Card key={friend.id} variant="outlined" sx={{ borderRadius: 2, borderColor: friend.blocked ? "warning.light" : "divider" }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flex: 1, minWidth: 0 }}>
                          <Avatar
                            sx={{
                              width: 52,
                              height: 52,
                              background: "linear-gradient(135deg, #1d4ed8 0%, #0f766e 100%)",
                              fontWeight: 800,
                            }}
                          >
                            {friend.name?.[0] || friend.email?.[0] || "?"}
                          </Avatar>

                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                              {friend.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
                              {friend.email}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Chip
                                label={friend.blocked ? "Blocked" : "Active"}
                                size="small"
                                color={friend.blocked ? "warning" : "success"}
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        </Box>

                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton size="small" sx={{ color: "#0f766e" }}>
                            <ChatIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" sx={{ color: "#0f766e" }}>
                            <PersonAddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 5 }}>
                <PeopleIcon sx={{ fontSize: 64, color: "text.disabled", mb: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  No friends yet
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Send a request by email and accepted users will appear here.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ display: "grid", gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Pending requests
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {filteredInvites.length} request{filteredInvites.length === 1 ? "" : "s"} waiting for your reply
              </Typography>
            </Box>

            <Divider />

            {filteredInvites.length > 0 ? (
              <Box sx={{ display: "grid", gap: 1.5 }}>
                {filteredInvites.map((invite) => (
                  <Card key={invite.id} variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ p: 2, display: "grid", gap: 1.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "flex-start" }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {invite.fromUserName}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {invite.fromUserEmail || "Friend request sent to your account"}
                          </Typography>
                          {invite.createdAt && (
                            <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mt: 0.5 }}>
                              {formatTimestamp(invite.createdAt)}
                            </Typography>
                          )}
                        </Box>
                        <Chip label="Request" size="small" color="primary" variant="outlined" />
                      </Box>

                      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => void handleInviteResponse(invite.id, invite.inviteId, false)}
                          disabled={isSubmitting}
                          startIcon={<CloseIcon />}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => void handleInviteResponse(invite.id, invite.inviteId, true)}
                          disabled={isSubmitting}
                          startIcon={<CheckIcon />}
                        >
                          Accept
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 5 }}>
                <PeopleIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  No pending requests
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
