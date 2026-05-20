import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupsIcon from "@mui/icons-material/Groups";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  Avatar,
  IconButton,
  InputAdornment,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";

import { useAppState } from "../../app/AppStateContext";
import {
  createGroupInvite,
  getGroup,
  listFriendSummaries,
  listGroupMembers,
  type FriendSummary,
  type Group,
  type GroupMember,
} from "../../shared/api/backend";
import { formatCount } from "../../shared/lib/format";

function resolveFriendKey(friend: FriendSummary) {
  return friend.id || friend.email;
}

export function GroupSettingsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { backendUrl, currentUser, session, setNotice } = useAppState();
  const [group, setGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [friends, setFriends] = useState<FriendSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sentInvites, setSentInvites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) {
      setErrorMessage("Missing group id.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [groupSnapshot, friendSummaries, memberList] = await Promise.all([
          getGroup(backendUrl, id, session?.accessToken),
          session?.accessToken ? listFriendSummaries(backendUrl, session.accessToken) : Promise.resolve([]),
          session?.accessToken ? listGroupMembers(backendUrl, id, session.accessToken) : Promise.resolve([]),
        ]);

        if (isMounted) {
          setGroup(groupSnapshot);
          setFriends(friendSummaries);
          setGroupMembers(memberList);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "Failed to load group settings.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [backendUrl, id, session?.accessToken]);

  const members = groupMembers.length > 0 ? groupMembers : group?.members ?? [];
  const memberIds = useMemo(() => new Set(members.map((member) => member.id)), [members]);

  const visibleFriends = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return friends.filter((friend) => {
      const searchable = `${friend.name} ${friend.email}`.toLowerCase();

      if (term && !searchable.includes(term)) {
        return false;
      }

      return !memberIds.has(friend.id);
    });
  }, [friends, memberIds, searchTerm]);

  const handleInviteFriend = async (friend: FriendSummary) => {
    if (!id || !session?.accessToken) {
      setErrorMessage("Sign in to invite friends to this group.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await createGroupInvite(
        backendUrl,
        {
          groupId: id,
          invitedUserId: friend.id,
          message: `Join ${group?.name ?? "this group"}`,
        },
        session.accessToken
      );

      setSentInvites((current) => ({ ...current, [resolveFriendKey(friend)]: true }));
      setNotice({ tone: "success", message: `Invite sent to ${friend.name}.` });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to invite friend.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => navigate(`/groups/${id}`)} sx={{ color: "text.secondary" }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.4 }}>
              Group settings
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Invite friends, review the member list, and manage access for this group.
            </Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          startIcon={<SettingsIcon />}
          onClick={() => navigate(`/groups/${id}`)}
          sx={{ textTransform: "none", fontWeight: 700, whiteSpace: "nowrap" }}
        >
          Back to group
        </Button>
      </Box>

      {errorMessage && <Alert severity="warning">{errorMessage}</Alert>}

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.8fr" } }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ display: "grid", gap: 2 }}>
            <Box sx={{ display: "grid", gap: 0.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Invite friends
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Pick a friend from your list and send them a group invite.
              </Typography>
            </Box>

            <TextField
              fullWidth
              size="small"
              placeholder="Search friends"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Divider />

            {isLoading ? (
              <Box sx={{ display: "grid", gap: 1.5 }}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} variant="rounded" height={88} />
                ))}
              </Box>
            ) : visibleFriends.length > 0 ? (
              <Box sx={{ display: "grid", gap: 1.5 }}>
                {visibleFriends.map((friend) => {
                  const isSent = Boolean(sentInvites[resolveFriendKey(friend)]);

                  return (
                    <Box
                      key={friend.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <Avatar sx={{ bgcolor: "#4f46e5", color: "white", fontWeight: 700 }}>
                        {friend.name?.[0] || friend.email?.[0] || "?"}
                      </Avatar>

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                          {friend.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
                          {friend.email}
                        </Typography>
                      </Box>

                      <Button
                        variant="contained"
                        startIcon={<PersonAddIcon />}
                        onClick={() => void handleInviteFriend(friend)}
                        disabled={isSaving || isSent || friend.blocked}
                        sx={{ textTransform: "none", fontWeight: 700, whiteSpace: "nowrap" }}
                      >
                        {isSent ? "Invited" : friend.blocked ? "Blocked" : "Invite"}
                      </Button>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <PersonAddIcon sx={{ fontSize: 56, color: "text.disabled", mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  No friends available
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Add friends first, then invite them into the group from here.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ display: "grid", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <GroupsIcon sx={{ color: "#4f46e5" }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Current members
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {formatCount(members.length)} member{members.length === 1 ? "" : "s"}
                </Typography>
              </Box>
            </Box>

            <Divider />

            {isLoading ? (
              <Box sx={{ display: "grid", gap: 1.5 }}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} variant="rounded" height={64} />
                ))}
              </Box>
            ) : members.length > 0 ? (
              <Box sx={{ display: "grid", gap: 1.25 }}>
                {members.map((member) => (
                  <Box
                    key={member.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1.25,
                      borderRadius: 2,
                      bgcolor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Avatar sx={{ width: 36, height: 36, bgcolor: "#e0e7ff", color: "#4f46e5", fontWeight: 700 }}>
                      {member.avatar || member.name[0]}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                        {member.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }} noWrap>
                        {member.email || "No email available"}
                      </Typography>
                    </Box>
                    {(member.id === currentUser?.id || member.email === currentUser?.email) && (
                      <Chip label="You" size="small" sx={{ bgcolor: "#e0e7ff", color: "#4f46e5" }} />
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 2 }}>
                No members found in this group.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}