import { useEffect, useMemo, useState } from "react";

import { useAppState } from "../../app/AppStateContext";
import { getGroupDebtBoard, listFriendSummaries, type FriendSummary, type GroupDebtBoard } from "../../shared/api/backend";

export function useProfileStats() {
  const { backendUrl, currentUser, groups, session } = useAppState();
  const [debtBoards, setDebtBoards] = useState<GroupDebtBoard[]>([]);
  const [friends, setFriends] = useState<FriendSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const load = async () => {
      const [boards, friendSummaries] = await Promise.all([
        Promise.all(groups.map((group) => getGroupDebtBoard(backendUrl, group.id, session?.accessToken).catch(() => null))),
        session?.accessToken
          ? listFriendSummaries(backendUrl, session.accessToken).catch(() => [] as FriendSummary[])
          : Promise.resolve([] as FriendSummary[]),
      ]);

      if (!isMounted) return;

      setDebtBoards(boards.filter((board): board is GroupDebtBoard => board !== null));
      setFriends(friendSummaries);
      setIsLoading(false);
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [backendUrl, groups, session?.accessToken]);

  const stats = useMemo(() => {
    const currentUserId = currentUser?.id;
    let totalSettled = 0;
    let currentlyOpen = 0;

    for (const board of debtBoards) {
      for (const expense of board.expenses) {
        for (const participant of expense.participants) {
          const involvesCurrentUser =
            participant.userId === currentUserId || expense.paidByUserId === currentUserId;

          if (!involvesCurrentUser) continue;

          if (participant.status === "payment-confirmed") {
            totalSettled += participant.shareAmount;
          } else {
            currentlyOpen += participant.shareAmount;
          }
        }
      }
    }

    return { totalSettled, currentlyOpen, friendsCount: friends.length };
  }, [debtBoards, currentUser?.id, friends.length]);

  return { ...stats, isLoading };
}
