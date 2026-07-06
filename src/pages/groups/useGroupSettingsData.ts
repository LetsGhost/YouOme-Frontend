import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppState } from "../../app/AppStateContext";
import {
  createGroupInvite,
  deleteGroup,
  deleteGroupAvatar,
  getGroup,
  getGroupPolicy,
  listFriendSummaries,
  listGroupMembers,
  updateGroupPolicy,
  uploadGroupAvatar,
  type FriendSummary,
  type Group,
  type GroupMember,
  type GroupPolicy,
  type GroupPolicyFields,
} from "../../shared/api/backend";
import { resolveFriendKey } from "./groupSettingsHelpers";

export function useGroupSettingsData(id: string | undefined) {
  const navigate = useNavigate();
  const { backendUrl, currentUser, session, setNotice, reloadGroups } = useAppState();
  const [group, setGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [friends, setFriends] = useState<FriendSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
  const isOwnerAdminOrModerator =
    isOwnerOrAdmin || currentMembership?.role === "moderator";
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

  return {
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
  };
}
