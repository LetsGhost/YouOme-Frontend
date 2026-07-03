import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Search, UserPlus, Users, ShieldCheck, Trash2, TriangleAlert } from "lucide-react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  Skeleton,
  Switch,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";

import { useAppState } from "../../app/AppStateContext";
import {
  createGroupInvite,
  deleteGroup,
  deleteGroupAvatar,
  getGroup,
  getGroupPolicy,
  listFriendSummaries,
  listGroupMembers,
  resolveAvatarUrl,
  updateGroupPolicy,
  uploadGroupAvatar,
  type FriendSummary,
  type Group,
  type GroupMember,
  type GroupPolicy,
  type GroupPolicyFields,
} from "../../shared/api/backend";
import { formatCount } from "../../shared/lib/format";
import { AvatarUploader } from "../../widgets/avatar/AvatarUploader";

const noop = async () => {
  void 0;
};

function resolveFriendKey(friend: FriendSummary) {
  return friend.id || friend.email;
}

export function GroupSettingsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { backendUrl, currentUser, session, setNotice, reloadGroups } = useAppState();
  const [group, setGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [friends, setFriends] = useState<FriendSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sentInvites, setSentInvites] = useState<Record<string, boolean>>({});
  const [policy, setPolicy] = useState<GroupPolicy | null>(null);
  const [isPolicyLoading, setIsPolicyLoading] = useState(false);
  const [isPolicySaving, setIsPolicySaving] = useState(false);
  const [policyError, setPolicyError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const currentMembership = useMemo(
    () => members.find((member) => member.id === currentUser?.id || member.email === currentUser?.email),
    [members, currentUser?.id, currentUser?.email]
  );

  const isOwnerOrAdmin = currentMembership?.role === "owner" || currentMembership?.role === "admin";
  const isOwner = currentMembership?.role === "owner";

  useEffect(() => {
    if (!id || !isOwnerOrAdmin || !session?.accessToken) {
      return;
    }

    let isMounted = true;

    const loadPolicy = async () => {
      setIsPolicyLoading(true);
      setPolicyError(null);

      try {
        const policySnapshot = await getGroupPolicy(backendUrl, id, session.accessToken);
        if (isMounted) {
          setPolicy(policySnapshot);
        }
      } catch (error) {
        if (isMounted) {
          setPolicyError(error instanceof Error ? error.message : "Failed to load group policy.");
        }
      } finally {
        if (isMounted) {
          setIsPolicyLoading(false);
        }
      }
    };

    void loadPolicy();

    return () => {
      isMounted = false;
    };
  }, [backendUrl, id, isOwnerOrAdmin, session?.accessToken]);

  const handlePolicyFieldChange = (field: keyof GroupPolicyFields, value: boolean | string) => {
    setPolicy((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleSavePolicy = async () => {
    if (!id || !session?.accessToken || !policy) {
      return;
    }

    setIsPolicySaving(true);
    setPolicyError(null);

    try {
      const updated = await updateGroupPolicy(
        backendUrl,
        id,
        {
          canMembersInvite: policy.canMembersInvite,
          canEditorsAddExpense: policy.canEditorsAddExpense,
          canModeratorsAddExpense: policy.canModeratorsAddExpense,
          visibilityMode: policy.visibilityMode,
          canViewParticipatedExpenseDetails: policy.canViewParticipatedExpenseDetails,
          requireReceiverConfirmationForSettlement: policy.requireReceiverConfirmationForSettlement,
          allowMemberRoleSelfLeave: policy.allowMemberRoleSelfLeave,
        },
        session.accessToken
      );

      setPolicy(updated);
      setNotice({ tone: "success", message: "Group policy updated." });
    } catch (error) {
      setPolicyError(error instanceof Error ? error.message : "Failed to update group policy.");
    } finally {
      setIsPolicySaving(false);
    }
  };

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

  const handleDeleteGroup = async () => {
    if (!id || !session?.accessToken) {
      setDeleteError("Sign in to delete this group.");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteGroup(backendUrl, id, session.accessToken);
      setIsDeleteDialogOpen(false);
      setNotice({ tone: "success", message: `${group?.name ?? "Group"} was deleted.` });
      await reloadGroups();
      navigate("/groups");
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Failed to delete group.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUploadAvatar = async (file: File) => {
    if (!id) return;

    try {
      const updated = await uploadGroupAvatar(backendUrl, id, file, session?.accessToken);
      setGroup(updated);
      await reloadGroups();
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Failed to upload group avatar." });
    }
  };

  const handleRemoveAvatar = async () => {
    if (!id) return;

    try {
      const updated = await deleteGroupAvatar(backendUrl, id, session?.accessToken);
      setGroup(updated);
      await reloadGroups();
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Failed to remove group avatar." });
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, pb: 2, borderBottom: "1px solid var(--color-border)" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <IconButton onClick={() => navigate(`/groups/${id}`)} sx={{ color: "var(--color-muted)", "&:hover": { color: "var(--color-ink)" } }}>
            <ChevronLeft size={22} strokeWidth={2} />
          </IconButton>
          <AvatarUploader
            src={resolveAvatarUrl(backendUrl, group?.avatarUrl)}
            token={session?.accessToken}
            fallback={<Users size={24} strokeWidth={2} />}
            size={56}
            shape="rounded"
            editable={isOwnerOrAdmin}
            onUpload={handleUploadAvatar}
            onRemove={handleRemoveAvatar}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.4, color: "var(--color-ink)" }}>
              Group settings
            </Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          startIcon={<ChevronLeft size={16} strokeWidth={2} />}
          onClick={() => navigate(`/groups/${id}`)}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            whiteSpace: "nowrap",
            borderColor: "var(--color-border)",
            color: "var(--color-ink)",
            flexShrink: 0,
          }}
        >
          Back to group
        </Button>
      </Box>

      {errorMessage && <Alert severity="warning">{errorMessage}</Alert>}

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.8fr" } }}>
        <Card sx={{ borderRadius: "var(--radius-md)" }}>
          <CardContent sx={{ display: "grid", gap: 2 }}>
            <Box sx={{ display: "grid", gap: 0.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "var(--color-ink)" }}>
                Invite friends
              </Typography>
              <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
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
                      <Search size={16} strokeWidth={2} color="var(--color-muted)" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Divider sx={{ borderColor: "var(--color-border)" }} />

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
                        borderRadius: "var(--radius-md)",
                        bgcolor: "var(--color-surface-2)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <AvatarUploader
                        src={resolveAvatarUrl(backendUrl, friend.avatarUrl)}
                        token={session?.accessToken}
                        fallback={friend.name?.[0] || friend.email?.[0] || "?"}
                        size={40}
                        onUpload={noop}
                        onRemove={noop}
                      />

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--color-ink)" }} noWrap>
                          {friend.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "var(--color-muted)" }} noWrap>
                          {friend.email}
                        </Typography>
                      </Box>

                      <Button
                        startIcon={<UserPlus size={16} strokeWidth={2} />}
                        onClick={() => void handleInviteFriend(friend)}
                        disabled={isSaving || isSent || friend.blocked}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          bgcolor: "var(--color-accent)",
                          color: "var(--color-accent-contrast)",
                          "&:hover": { bgcolor: "var(--color-accent)", filter: "brightness(0.92)" },
                          "&.Mui-disabled": {
                            bgcolor: "var(--color-surface-3)",
                            color: "var(--color-muted)",
                          },
                        }}
                      >
                        {isSent ? "Invited" : friend.blocked ? "Blocked" : "Invite"}
                      </Button>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <UserPlus size={48} strokeWidth={1.8} color="var(--color-muted-3)" style={{ marginBottom: 8 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, color: "var(--color-ink)" }}>
                  No friends available
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
                  Add friends first, then invite them into the group from here.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: "var(--radius-md)" }}>
          <CardContent sx={{ display: "grid", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Users size={18} strokeWidth={2} color="var(--color-accent)" />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "var(--color-ink)" }}>
                  Current members
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
                  {formatCount(members.length)} member{members.length === 1 ? "" : "s"}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ borderColor: "var(--color-border)" }} />

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
                      borderRadius: "var(--radius-md)",
                      bgcolor: "var(--color-surface-2)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <AvatarUploader
                      src={resolveAvatarUrl(backendUrl, member.avatarUrl)}
                      token={session?.accessToken}
                      fallback={member.avatar || member.name?.[0] || "?"}
                      size={36}
                      onUpload={noop}
                      onRemove={noop}
                    />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "var(--color-ink)" }} noWrap>
                        {member.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "var(--color-muted)" }} noWrap>
                        {member.email || "No email available"}
                      </Typography>
                    </Box>
                    {(member.id === currentUser?.id || member.email === currentUser?.email) && (
                      <Chip
                        label="You"
                        size="small"
                        sx={{ bgcolor: "var(--color-accent-soft-bg)", color: "var(--color-accent-soft-ink)" }}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: "var(--color-muted)", textAlign: "center", py: 2 }}>
                No members found in this group.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      {isOwnerOrAdmin && (
        <Card sx={{ borderRadius: "var(--radius-md)" }}>
          <CardContent sx={{ display: "grid", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ShieldCheck size={18} strokeWidth={2} color="var(--color-accent)" />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "var(--color-ink)" }}>
                  Group policy
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
                  Owner/admin-only rules that govern how this group behaves.
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ borderColor: "var(--color-border)" }} />

            {policyError && <Alert severity="warning">{policyError}</Alert>}

            {isPolicyLoading || !policy ? (
              <Box sx={{ display: "grid", gap: 1.5 }}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} variant="rounded" height={40} />
                ))}
              </Box>
            ) : (
              <Box sx={{ display: "grid", gap: 1.5 }}>
                <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={policy.canMembersInvite}
                        onChange={(event) => handlePolicyFieldChange("canMembersInvite", event.target.checked)}
                      />
                    }
                    label="Members can invite others"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={policy.canEditorsAddExpense}
                        onChange={(event) => handlePolicyFieldChange("canEditorsAddExpense", event.target.checked)}
                      />
                    }
                    label="Editors can add expenses"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={policy.canModeratorsAddExpense}
                        onChange={(event) => handlePolicyFieldChange("canModeratorsAddExpense", event.target.checked)}
                      />
                    }
                    label="Moderators can add expenses"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={policy.canViewParticipatedExpenseDetails}
                        onChange={(event) =>
                          handlePolicyFieldChange("canViewParticipatedExpenseDetails", event.target.checked)
                        }
                      />
                    }
                    label="Members can view details of expenses they're in"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={policy.requireReceiverConfirmationForSettlement}
                        onChange={(event) =>
                          handlePolicyFieldChange("requireReceiverConfirmationForSettlement", event.target.checked)
                        }
                      />
                    }
                    label="Require receiver confirmation for settlements"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={policy.allowMemberRoleSelfLeave}
                        onChange={(event) => handlePolicyFieldChange("allowMemberRoleSelfLeave", event.target.checked)}
                      />
                    }
                    label="Members can leave the group themselves"
                  />
                </Box>

                <TextField
                  label="Visibility mode"
                  size="small"
                  value={policy.visibilityMode}
                  onChange={(event) => handlePolicyFieldChange("visibilityMode", event.target.value)}
                  helperText="Free-text visibility mode used by this group (e.g. private, members)."
                  sx={{ maxWidth: 320 }}
                />

                <Box>
                  <Button
                    onClick={() => void handleSavePolicy()}
                    disabled={isPolicySaving}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      bgcolor: "var(--color-accent)",
                      color: "var(--color-accent-contrast)",
                      "&:hover": { bgcolor: "var(--color-accent)", filter: "brightness(0.92)" },
                    }}
                  >
                    {isPolicySaving ? "Saving..." : "Save policy"}
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {isOwner && (
        <Card sx={{ borderRadius: "var(--radius-md)", border: "1px solid var(--color-danger-border)", bgcolor: "var(--color-danger-soft-bg)" }}>
          <CardContent sx={{ display: "grid", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TriangleAlert size={18} strokeWidth={2} color="var(--color-danger)" />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "var(--color-danger)" }}>
                  Danger zone
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
                  Deleting this group permanently removes it, its members, and its policy for everyone.
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ borderColor: "var(--color-danger-border)" }} />

            <Box>
              <Button
                variant="outlined"
                startIcon={<Trash2 size={16} strokeWidth={2} />}
                onClick={() => {
                  setDeleteError(null);
                  setIsDeleteDialogOpen(true);
                }}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  color: "var(--color-danger)",
                  borderColor: "var(--color-danger-border)",
                  "&:hover": { borderColor: "var(--color-danger)", bgcolor: "var(--color-danger-soft-bg)" },
                }}
              >
                Delete group
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => (isDeleting ? undefined : setIsDeleteDialogOpen(false))}
        slotProps={{ paper: { sx: { borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "var(--color-ink)" }}>Delete {group?.name ?? "this group"}?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "var(--color-muted)" }}>
            This action can't be undone. All members will lose access, and the group's data will be permanently
            removed.
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={isDeleting}
            sx={{ textTransform: "none", fontWeight: 700, color: "var(--color-ink)" }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleDeleteGroup()}
            disabled={isDeleting}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              bgcolor: "var(--color-danger)",
              color: "var(--color-accent-contrast)",
              "&:hover": { bgcolor: "var(--color-danger)", filter: "brightness(0.92)" },
            }}
          >
            {isDeleting ? "Deleting..." : "Delete group"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
