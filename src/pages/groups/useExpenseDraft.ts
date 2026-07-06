import { useEffect, useMemo, useState } from "react";

import { createExpense, getSettlementSchedule, type CurrentUser, type GroupMember } from "../../shared/api/backend";
import { ExpenseDraft, SplitType, getParticipantBreakdown, seedParticipantShares, toCents } from "./groupDetailsHelpers";

const emptyDraft: ExpenseDraft = {
  title: "",
  amount: "",
  paidBy: "",
  description: "",
  splitType: "equal",
  participantIds: [],
  participantShares: {},
  chargeSameAmount: false,
  includeInNextSettlement: true,
};

export function useExpenseDraft({
  id,
  backendUrl,
  currentUser,
  accessToken,
  members,
  setErrorMessage,
  onExpenseCreated,
}: {
  id: string | undefined;
  backendUrl: string;
  currentUser: CurrentUser | null;
  accessToken?: string;
  members: GroupMember[];
  setErrorMessage: (message: string | null) => void;
  onExpenseCreated: () => Promise<void>;
}) {
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [expenseData, setExpenseData] = useState<ExpenseDraft>(emptyDraft);
  const [nextSettlementDate, setNextSettlementDate] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    getSettlementSchedule(backendUrl, id, accessToken)
      .then((schedule) => {
        if (!cancelled) {
          setNextSettlementDate(schedule?.isActive ? schedule.nextRunAt ?? null : null);
        }
      })
      .catch(() => {
        if (!cancelled) setNextSettlementDate(null);
      });

    return () => {
      cancelled = true;
    };
  }, [id, backendUrl, accessToken]);

  const participantMembers = members.filter((member) => expenseData.participantIds.includes(member.id) && member.id !== expenseData.paidBy);
  const payerMember = members.find((member) => member.id === expenseData.paidBy) ?? null;
  const participantBreakdown = useMemo(() => {
    const amount = Number(expenseData.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return { shares: new Map<string, number>() } as const;
    }

    return getParticipantBreakdown(
      amount,
      expenseData.splitType,
      expenseData.participantIds.filter((participantId) => participantId !== expenseData.paidBy),
      expenseData.participantShares,
      expenseData.paidBy,
      expenseData.chargeSameAmount
    );
  }, [
    expenseData.amount,
    expenseData.participantIds,
    expenseData.participantShares,
    expenseData.paidBy,
    expenseData.splitType,
    expenseData.chargeSameAmount,
  ]);

  const previewShares: Map<string, number> =
    "shares" in participantBreakdown && participantBreakdown.shares
      ? participantBreakdown.shares
      : new Map<string, number>();
  const previewMembers = payerMember ? [payerMember, ...participantMembers] : participantMembers;
  const equalSplitHasRemainder =
    expenseData.splitType === "equal" &&
    previewMembers.length > 0 &&
    Number.isFinite(Number(expenseData.amount)) &&
    Number(expenseData.amount) > 0 &&
    toCents(Number(expenseData.amount)) % previewMembers.length !== 0;

  const openExpenseDialog = () => {
    const defaultPaidBy = currentUser?.id || members[0]?.id || "";
    const defaultParticipantIds = members.filter((member) => member.id !== defaultPaidBy).map((member) => member.id);

    setErrorMessage(null);
    setExpenseData({
      title: "",
      amount: "",
      paidBy: defaultPaidBy,
      description: "",
      splitType: "equal",
      participantIds: defaultParticipantIds,
      participantShares: {},
      chargeSameAmount: false,
      includeInNextSettlement: true,
    });
    setShowExpenseDialog(true);
  };

  const setPaidBy = (paidBy: string) => {
    const nextParticipantIds = members.filter((member) => member.id !== paidBy).map((member) => member.id);

    setExpenseData((current) => ({
      ...current,
      paidBy,
      participantIds: nextParticipantIds,
      participantShares: current.splitType === "equal" ? {} : seedParticipantShares(Number(current.amount) || 0, nextParticipantIds, current.splitType),
    }));
  };

  const setSplitType = (splitType: SplitType) => {
    const participantIds = expenseData.participantIds.filter((participantId) => participantId !== expenseData.paidBy);

    setExpenseData((current) => ({
      ...current,
      splitType,
      participantShares: splitType === "equal" ? {} : seedParticipantShares(Number(current.amount) || 0, participantIds, splitType),
    }));
  };

  const toggleParticipant = (memberId: string) => {
    setExpenseData((current) => {
      const participantIds = current.participantIds.includes(memberId)
        ? current.participantIds.filter((participantId) => participantId !== memberId)
        : [...current.participantIds, memberId];

      return {
        ...current,
        participantIds,
        participantShares:
          current.splitType === "equal" ? {} : seedParticipantShares(Number(current.amount) || 0, participantIds, current.splitType),
      };
    });
  };

  const setParticipantShare = (memberId: string, value: string) => {
    setExpenseData((current) => ({
      ...current,
      participantShares: {
        ...current.participantShares,
        [memberId]: value,
      },
    }));
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      setErrorMessage("Missing group id.");
      return;
    }

    const amount = Number(expenseData.amount);

    if (Number.isNaN(amount) || amount <= 0) {
      setErrorMessage("Enter a valid expense amount.");
      return;
    }

    const participantIds = expenseData.participantIds.filter((participantId) => participantId !== expenseData.paidBy);
    const breakdown = getParticipantBreakdown(
      amount,
      expenseData.splitType,
      participantIds,
      expenseData.participantShares,
      expenseData.paidBy || currentUser?.id || "",
      expenseData.chargeSameAmount
    );

    if ("error" in breakdown) {
      setErrorMessage(breakdown.error ?? "Failed to calculate the split.");
      return;
    }

    if (participantIds.length === 0) {
      setErrorMessage("Select at least one participant.");
      return;
    }

    void (async () => {
      setErrorMessage(null);

      try {
        await createExpense(
          backendUrl,
          {
            groupId: id,
            createdByUserId: currentUser?.id || "",
            title: expenseData.title.trim(),
            totalAmount: amount,
            paidByUserId: expenseData.paidBy || currentUser?.id,
            splitType: expenseData.splitType,
            note: expenseData.description.trim() || undefined,
            includeInNextSettlement: expenseData.includeInNextSettlement,
            participants: participantIds.map((participantId) => ({
              userId: participantId,
              shareAmount: breakdown.shares.get(participantId) ?? 0,
            })),
          },
          accessToken
        );

        await onExpenseCreated();
        setShowExpenseDialog(false);
        setExpenseData({
          title: "",
          amount: "",
          paidBy: currentUser?.id || "",
          description: "",
          splitType: "equal",
          participantIds: [],
          participantShares: {},
          chargeSameAmount: false,
          includeInNextSettlement: true,
        });
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to create expense.");
      }
    })();
  };

  return {
    showExpenseDialog,
    setShowExpenseDialog,
    expenseData,
    setExpenseData,
    nextSettlementDate,
    previewShares,
    previewMembers,
    equalSplitHasRemainder,
    openExpenseDialog,
    setPaidBy,
    setSplitType,
    toggleParticipant,
    setParticipantShare,
    handleCreateExpense,
  };
}
