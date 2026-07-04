import { useCallback, useEffect, useMemo, useState } from "react";

import { useAppState } from "../../app/AppStateContext";
import {
  getGroup,
  listGroupExpenses,
  listGroupMembers,
  type Group,
  type GroupDebtBoard,
  type GroupMember,
  type PaginatedGroupExpenses,
} from "../../shared/api/backend";
import { EXPENSES_PAGE_SIZE } from "./groupDetailsHelpers";

export function useGroupDetailsData(id: string | undefined) {
  const { backendUrl, currentUser, session } = useAppState();
  const [group, setGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [debtBoard, setDebtBoard] = useState<GroupDebtBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expensesData, setExpensesData] = useState<PaginatedGroupExpenses | null>(null);
  const [expensesPageNum, setExpensesPageNum] = useState(1);
  const [isExpensesLoading, setIsExpensesLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setErrorMessage("Missing group id.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadGroup = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [snapshot, memberList] = await Promise.all([
          getGroup(backendUrl, id, session?.accessToken),
          session?.accessToken ? listGroupMembers(backendUrl, id, session.accessToken) : Promise.resolve([]),
        ]);

        if (isMounted) {
          setGroup(snapshot);
          setGroupMembers(memberList);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "Failed to load the group.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadGroup();

    return () => {
      isMounted = false;
    };
  }, [backendUrl, currentUser?.email, id, session?.accessToken]);

  const loadExpensesPage = useCallback(
    async (page: number) => {
      if (!id) {
        return;
      }

      setIsExpensesLoading(true);

      try {
        const data = await listGroupExpenses(backendUrl, id, { page, limit: EXPENSES_PAGE_SIZE }, session?.accessToken);
        setExpensesData(data);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to load expenses.");
      } finally {
        setIsExpensesLoading(false);
      }
    },
    [backendUrl, id, session?.accessToken]
  );

  useEffect(() => {
    void loadExpensesPage(expensesPageNum);
  }, [expensesPageNum, loadExpensesPage]);

  const members = groupMembers.length > 0 ? groupMembers : group?.members ?? [];
  const expenses = expensesData?.items ?? [];
  const totalExpensesCount = expensesData?.total ?? 0;

  const { youOwe, owedToYou } = useMemo(() => {
    const currentUserId = currentUser?.id;
    let owe = 0;
    let owed = 0;

    for (const expense of debtBoard?.expenses ?? []) {
      for (const participant of expense.participants) {
        if (participant.status === "payment-confirmed") {
          continue;
        }

        if (participant.userId === currentUserId) {
          owe += participant.shareAmount;
        }

        if (expense.paidByUserId === currentUserId && participant.userId !== currentUserId) {
          owed += participant.shareAmount;
        }
      }
    }

    return { youOwe: owe, owedToYou: owed };
  }, [debtBoard, currentUser?.id]);

  const refreshAfterExpenseCreated = async () => {
    if (!id) {
      return;
    }

    const refreshed = await getGroup(backendUrl, id, session?.accessToken);
    setGroup(refreshed);
    setExpensesPageNum(1);
    void loadExpensesPage(1);
  };

  return {
    group,
    members,
    debtBoard,
    setDebtBoard,
    isLoading,
    errorMessage,
    setErrorMessage,
    expenses,
    expensesData,
    totalExpensesCount,
    expensesPageNum,
    setExpensesPageNum,
    isExpensesLoading,
    youOwe,
    owedToYou,
    refreshAfterExpenseCreated,
  };
}
