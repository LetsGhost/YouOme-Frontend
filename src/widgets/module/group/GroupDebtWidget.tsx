import { Clock3, RefreshCw } from "lucide-react";
import { Alert, Box, Button, Card, CardContent, Skeleton, Stack, Typography } from "@mui/material";

import type { GroupDebtBoard, GroupDebtExpense } from "../../../shared/api/backend";
import { DebtSummaryStats } from "./DebtSummaryStats";
import { DeleteExpenseDialog } from "./DeleteExpenseDialog";
import { EditExpenseDialog } from "./EditExpenseDialog";
import { ExpenseDetailDialog } from "./ExpenseDetailDialog";
import { ExpenseListCard } from "./ExpenseListCard";
import { useGroupDebtBoard } from "./useGroupDebtBoard";

type GroupDebtWidgetProps = {
  backendUrl: string;
  groupId: string;
  currentUserId?: string;
  accessToken?: string;
  onBoardChange?: (board: GroupDebtBoard | null) => void;
};

export function GroupDebtWidget({ backendUrl, groupId, currentUserId, accessToken, onBoardChange }: GroupDebtWidgetProps) {
  const {
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
    closeEditDialog,
    handleSaveEdit,
    deletingExpense,
    isDeletingExpense,
    deleteExpenseError,
    openDeleteDialog,
    closeDeleteDialog,
    handleDeleteExpense,
    viewingExpenseId,
    setViewingExpenseId,
  } = useGroupDebtBoard({ backendUrl, groupId, currentUserId, accessToken, onBoardChange });

  const viewingExpense = board?.expenses.find((candidate) => candidate.id === viewingExpenseId);

  const editFromDetail = (expense: GroupDebtExpense) => {
    setViewingExpenseId(null);
    openEditDialog(expense);
  };

  const deleteFromDetail = (expense: GroupDebtExpense) => {
    setViewingExpenseId(null);
    openDeleteDialog(expense);
  };

  return (
    <Card sx={{ borderRadius: "var(--radius-md)" }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--color-ink)" }}>
              Current debts
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={16} strokeWidth={2} />}
            onClick={() => void loadBoard()}
            sx={{ textTransform: "none", fontWeight: 700, borderColor: "var(--color-border)", color: "var(--color-ink)" }}
          >
            Refresh
          </Button>
        </Box>

        <DebtSummaryStats
          isLoading={isLoading}
          expenseCount={summary.expenseCount}
          pendingMyPayment={summary.pendingMyPayment}
          awaitingReview={summary.awaitingReview}
        />

        {errorMessage && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {isLoading ? (
          <Stack spacing={1.5}>
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index} variant="outlined" sx={{ borderRadius: "var(--radius-md)", borderColor: "var(--color-border)" }}>
                <CardContent sx={{ p: 2 }}>
                  <Skeleton width="45%" />
                  <Skeleton width="75%" />
                  <Skeleton width="65%" />
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : board?.expenses.length ? (
          <Stack spacing={1.5}>
            {board.expenses.map((expense) => (
              <ExpenseListCard
                key={expense.id}
                expense={expense}
                backendUrl={backendUrl}
                accessToken={accessToken}
                currentUserId={currentUserId}
                activeAction={activeAction}
                onView={setViewingExpenseId}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                onSubmitPayment={submitPayment}
                onApprovePayment={approvePayment}
                onRejectPayment={rejectPayment}
              />
            ))}
          </Stack>
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Clock3 size={48} strokeWidth={1.8} color="var(--color-muted-3)" style={{ marginBottom: 8 }} />
            <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.5, color: "var(--color-ink)" }}>
              No unsettled debts
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
              Everything in this group has been settled already.
            </Typography>
          </Box>
        )}
      </CardContent>

      <EditExpenseDialog
        open={Boolean(editingExpense)}
        form={editForm}
        onFormChange={(patch) => setEditForm((current) => ({ ...current, ...patch }))}
        isSaving={isSavingEdit}
        error={editError}
        onClose={closeEditDialog}
        onSave={() => void handleSaveEdit()}
      />

      <DeleteExpenseDialog
        open={Boolean(deletingExpense)}
        expenseTitle={deletingExpense?.title}
        isDeleting={isDeletingExpense}
        error={deleteExpenseError}
        onClose={closeDeleteDialog}
        onConfirm={() => void handleDeleteExpense()}
      />

      <ExpenseDetailDialog
        expense={viewingExpense}
        backendUrl={backendUrl}
        accessToken={accessToken}
        currentUserId={currentUserId}
        activeAction={activeAction}
        onClose={() => setViewingExpenseId(null)}
        onEdit={editFromDetail}
        onDelete={deleteFromDetail}
        onSubmitPayment={submitPayment}
        onApprovePayment={approvePayment}
        onRejectPayment={rejectPayment}
      />
    </Card>
  );
}
