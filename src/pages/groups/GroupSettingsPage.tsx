import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarClock } from "lucide-react";
import { Alert, Box, Button, Card, CardContent, Typography } from "@mui/material";

import { useAppState } from "../../app/AppStateContext";
import { CurrentMembersCard } from "./CurrentMembersCard";
import { DeleteGroupDialog } from "./DeleteGroupDialog";
import { GroupDangerZoneCard } from "./GroupDangerZoneCard";
import { GroupPolicyCard } from "./GroupPolicyCard";
import { GroupSettingsHeader } from "./GroupSettingsHeader";
import { InviteFriendsCard } from "./InviteFriendsCard";
import { useGroupSettingsData } from "./useGroupSettingsData";

export function GroupSettingsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { backendUrl, currentUser, session } = useAppState();
  const [searchTerm, setSearchTerm] = useState("");

  const {
    group,
    members,
    memberIds,
    friends,
    isLoading,
    isSaving,
    errorMessage,
    sentInvites,
    policy,
    isPolicyLoading,
    isPolicySaving,
    policyError,
    isOwnerOrAdmin,
    isOwnerAdminOrModerator,
    isOwner,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    deleteError,
    setDeleteError,
    handlePolicyFieldChange,
    handleSavePolicy,
    handleInviteFriend,
    handleDeleteGroup,
    handleUploadAvatar,
    handleRemoveAvatar,
  } = useGroupSettingsData(id);

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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <GroupSettingsHeader
        backendUrl={backendUrl}
        avatarUrl={group?.avatarUrl}
        accessToken={session?.accessToken}
        isOwnerOrAdmin={isOwnerOrAdmin}
        onBack={() => navigate(`/groups/${id}`)}
        onUploadAvatar={handleUploadAvatar}
        onRemoveAvatar={handleRemoveAvatar}
      />

      {errorMessage && <Alert severity="warning">{errorMessage}</Alert>}

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.8fr" } }}>
        <InviteFriendsCard
          isLoading={isLoading}
          friends={visibleFriends}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          sentInvites={sentInvites}
          isSaving={isSaving}
          backendUrl={backendUrl}
          accessToken={session?.accessToken}
          onInviteFriend={(friend) => void handleInviteFriend(friend)}
        />

        <CurrentMembersCard
          isLoading={isLoading}
          members={members}
          backendUrl={backendUrl}
          accessToken={session?.accessToken}
          currentUser={currentUser}
        />
      </Box>

      {isOwnerOrAdmin && (
        <GroupPolicyCard
          policy={policy}
          isPolicyLoading={isPolicyLoading}
          isPolicySaving={isPolicySaving}
          policyError={policyError}
          onFieldChange={handlePolicyFieldChange}
          onSave={() => void handleSavePolicy()}
        />
      )}

      {isOwnerAdminOrModerator && (
        <Card sx={{ borderRadius: "var(--radius-md)" }}>
          <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarClock size={18} strokeWidth={2} color="var(--color-accent)" />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "var(--color-ink)" }}>
                  Schedule settlement
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
                  Set up a recurring settlement or trigger one manually.
                </Typography>
              </Box>
            </Box>

            <Button
              onClick={() => navigate(`/groups/${id}/settlement-schedule`)}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "var(--color-accent)",
                color: "var(--color-accent-contrast)",
                "&:hover": { bgcolor: "var(--color-accent)", filter: "brightness(0.92)" },
              }}
            >
              Manage schedule
            </Button>
          </CardContent>
        </Card>
      )}

      {isOwner && (
        <GroupDangerZoneCard
          onDeleteClick={() => {
            setDeleteError(null);
            setIsDeleteDialogOpen(true);
          }}
        />
      )}

      <DeleteGroupDialog
        open={isDeleteDialogOpen}
        groupName={group?.name}
        isDeleting={isDeleting}
        error={deleteError}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => void handleDeleteGroup()}
      />
    </Box>
  );
}
