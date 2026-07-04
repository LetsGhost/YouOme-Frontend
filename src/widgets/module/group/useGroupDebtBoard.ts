import { useCallback, useEffect, useMemo, useState } from "react";

import {
  confirmExpensePayment,
  deleteExpense,
  getGroupDebtBoard,
  rejectExpensePayment,
  submitExpensePayment,
  updateExpense,
  type GroupDebtBoard,
  type GroupDebtExpense,
} from "../../../shared/api/backend";
import { getApproveKey, getRejectKey, getSubmitKey, hasReviewAction } from "./groupDebtWidgetHelpers";

export function useGroupDebtBoard({
  backendUrl,
  groupId,
  currentUserId,
  accessToken,
  onBoardChange,
}: {
  backendUrl: string;
  groupId: string;
  currentUserId?: string;
  accessToken?: string;
  onBoardChange?: (board: GroupDebtBoard | null) => void;
}) {
  const [board, setBoard] = useState<GroupDebtBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<GroupDebtExpense | null>(null);
  const [editForm, setEditForm] = useState({ title: "", totalAmount: "", note: "" });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<GroupDebtExpense | null>(null);
  const [isDeletingExpense, setIsDeletingExpense] = useState(false);
  const [deleteExpenseError, setDeleteExpenseError] = useState<string | null>(null);
  const [viewingExpenseId, setViewingExpenseId] = useState<string | null>(null);

  const loadBoard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const snapshot = await getGroupDebtBoard(backendUrl, groupId, accessToken);
      setBoard(snapshot);
      onBoardChange?.(snapshot);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load current debts.");
      setBoard(null);
      onBoardChange?.(null);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, backendUrl, groupId, onBoardChange]);

  useEffect(() => {
    void loadBoard();
  }, [loadBoard]);

  const summary = useMemo(() => {
    const expenses = board?.expenses ?? [];
    const pendingMyPayment = expenses.reduce((count, expense) => {
      return count + expense.participants.filter((participant) => participant.isCurrentUser && participant.status === "pending").length;
    }, 0);
    const awaitingReview = expenses.reduce((count, expense) => {
      return count + expense.participants.filter((participant) => hasReviewAction(expense, participant, currentUserId)).length;
    }, 0);

    return { expenseCount: expenses.length, pendingMyPayment, awaitingReview };
  }, [board?.expenses, currentUserId]);

  const runAction = async (actionKey: string, action: () => Promise<unknown>) => {
    setActiveAction(actionKey);

    try {
      await action();
      await loadBoard();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update payment status.");
    } finally {
      setActiveAction(null);
    }
  };

  const openEditDialog = (expense: GroupDebtExpense) => {
    setEditError(null);
    setEditForm({
      title: expense.title,
      totalAmount: String(expense.totalAmount),
      note: expense.description || "",
    });
    setEditingExpense(expense);
  };

  const handleSaveEdit = async () => {
    if (!editingExpense) {
      return;
    }

    const totalAmount = Number(editForm.totalAmount);

    if (!editForm.title.trim()) {
      setEditError("Title is required.");
      return;
    }

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      setEditError("Enter a valid amount.");
      return;
    }

    setIsSavingEdit(true);
    setEditError(null);

    try {
      await updateExpense(
        backendUrl,
        editingExpense.id,
        {
          title: editForm.title.trim(),
          totalAmount,
          note: editForm.note.trim() || undefined,
        },
        accessToken
      );

      setEditingExpense(null);
      await loadBoard();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Failed to update expense.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!deletingExpense) {
      return;
    }

    setIsDeletingExpense(true);
    setDeleteExpenseError(null);

    try {
      await deleteExpense(backendUrl, deletingExpense.id, accessToken);
      setDeletingExpense(null);
      await loadBoard();
    } catch (error) {
      setDeleteExpenseError(error instanceof Error ? error.message : "Failed to delete expense.");
    } finally {
      setIsDeletingExpense(false);
    }
  };

  const submitPayment = (expense: GroupDebtExpense, participantUserId: string) => {
    void runAction(getSubmitKey(expense.id, participantUserId), () =>
      submitExpensePayment(backendUrl, expense.id, participantUserId, undefined, accessToken)
    );
  };

  const approvePayment = (expense: GroupDebtExpense, participantUserId: string) => {
    void runAction(getApproveKey(expense.id, participantUserId), () =>
      confirmExpensePayment(backendUrl, expense.id, participantUserId, accessToken)
    );
  };

  const rejectPayment = (expense: GroupDebtExpense, participantUserId: string) => {
    void runAction(getRejectKey(expense.id, participantUserId), () =>
      rejectExpensePayment(backendUrl, expense.id, participantUserId, accessToken)
    );
  };

  return {
    board,
    isLoading,
    errorMessage,
    activeAction,
    summary,
    loadBoard,
    submitPayment,
    approvePayment,
    rejectPayment,
    editingExpense,
    editForm,
    setEditForm,
    isSavingEdit,
    editError,
    openEditDialog,
    closeEditDialog: () => setEditingExpense(null),
    handleSaveEdit,
    deletingExpense,
    isDeletingExpense,
    deleteExpenseError,
    openDeleteDialog: (expense: GroupDebtExpense) => {
      setDeleteExpenseError(null);
      setDeletingExpense(expense);
    },
    closeDeleteDialog: () => setDeletingExpense(null),
    handleDeleteExpense,
    viewingExpenseId,
    setViewingExpenseId,
  };
}
