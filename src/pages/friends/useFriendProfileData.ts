import { useEffect, useMemo, useState } from "react";

import { useAppState } from "../../app/AppStateContext";
import {
  getFriendshipStatus,
  getGroupDebtBoard,
  getUserById,
  listGroupMembers,
  removeFriend,
  type CurrentUser,
  type Group,
  type GroupDebtBoard,
} from "../../shared/api/backend";

export function useFriendProfileData(friendId: string | undefined) {
  const { backendUrl, currentUser, groups, session, setNotice } = useAppState();

  const [friend, setFriend] = useState<CurrentUser | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [sharedGroups, setSharedGroups] = useState<Group[]>([]);
  const [debtBoards, setDebtBoards] = useState<GroupDebtBoard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (!friendId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const load = async () => {
      // Group.members isn't embedded on the list response (membership lives in a
      // separate collection), so real membership has to be fetched per group.
      const [friendUser, status, membershipEntries] = await Promise.all([
        getUserById(backendUrl, friendId, session?.accessToken).catch(() => null),
        session?.accessToken
          ? getFriendshipStatus(backendUrl, friendId, session.accessToken).catch(() => null)
          : Promise.resolve(null),
        Promise.all(
          groups.map((group) =>
            listGroupMembers(backendUrl, group.id, session?.accessToken)
              .then((members) => ({ group, isMember: members.some((member) => member.id === friendId) }))
              .catch(() => ({ group, isMember: false }))
          )
        ),
      ]);

      const matchingGroups = membershipEntries.filter((entry) => entry.isMember).map((entry) => entry.group);

      const boards = await Promise.all(
        matchingGroups.map((group) => getGroupDebtBoard(backendUrl, group.id, session?.accessToken).catch(() => null))
      );

      if (!isMounted) return;

      setFriend(friendUser);
      setIsBlocked(status?.isBlocked ?? false);
      setSharedGroups(matchingGroups);
      setDebtBoards(boards.filter((board): board is GroupDebtBoard => board !== null));
      setIsLoading(false);
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [backendUrl, friendId, groups, session?.accessToken]);

  const owesYou = useMemo(() => {
    let total = 0;

    for (const board of debtBoards) {
      for (const expense of board.expenses) {
        if (expense.paidByUserId !== currentUser?.id) continue;

        for (const participant of expense.participants) {
          if (participant.userId === friendId && participant.status !== "payment-confirmed") {
            total += participant.shareAmount;
          }
        }
      }
    }

    return total;
  }, [debtBoards, currentUser?.id, friendId]);

  const handleRemoveFriend = async () => {
    if (!friendId) return false;

    setIsRemoving(true);
    try {
      await removeFriend(backendUrl, friendId, session?.accessToken);
      setNotice({ tone: "success", message: "Friend removed." });
      return true;
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Failed to remove friend." });
      return false;
    } finally {
      setIsRemoving(false);
    }
  };

  return {
    backendUrl,
    accessToken: session?.accessToken,
    friend,
    isBlocked,
    isLoading,
    isRemoving,
    sharedGroups,
    owesYou,
    handleRemoveFriend,
  };
}
