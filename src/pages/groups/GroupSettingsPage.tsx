import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box } from "@mui/material";

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
