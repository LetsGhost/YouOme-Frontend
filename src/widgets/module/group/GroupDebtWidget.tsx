import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  Skeleton,
} from "@mui/material";
import { CheckCircle2, X, Trash2, Pencil, Clock3, RefreshCw } from "lucide-react";

import {
  confirmExpensePayment,
  deleteExpense,
  getGroupDebtBoard,
  rejectExpensePayment,
  resolveAvatarUrl,
  submitExpensePayment,
  updateExpense,
  type GroupDebtBoard,
  type GroupDebtExpense,
  type GroupDebtParticipant,
} from "../../../shared/api/backend";
import { formatMoney } from "../../../shared/lib/format";
import { AvatarUploader } from "../../avatar/AvatarUploader";

const noop = async () => {
  void 0;
};

type GroupDebtWidgetProps = {
  backendUrl: string;
  groupId: string;
  currentUserId?: string;
  accessToken?: string;
  onBoardChange?: (board: GroupDebtBoard | null) => void;
};

const microLabelSx = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  color: "var(--color-muted)",
  display: "block",
};

const monoStatSx = {
  fontFamily: "var(--font-mono)",
  fontWeight: 700,
  fontSize: "1.35rem",
  color: "var(--color-ink)",
};

function getStatusLabel(status: GroupDebtParticipant["status"]) {
  if (status === "payment-submitted") {
    return "Awaiting review";
  }

  if (status === "payment-confirmed") {
    return "Paid";
  }

  return "Pending";
}

function getStatusTone(status: GroupDebtParticipant["status"]) {
  if (status === "payment-confirmed") {
    return "success";
  }

  if (status === "payment-submitted") {
    return "warning";
  }

  return "default";
}

function getStatusChipSx(status: GroupDebtParticipant["status"]) {
  const tone = getStatusTone(status);

  if (tone === "success") {
    return { bgcolor: "var(--color-success-soft-bg)", color: "var(--color-success)", border: "1px solid var(--color-success-border)" };
  }

  if (tone === "warning") {
    return { bgcolor: "var(--color-warning-soft-bg)", color: "var(--color-warning)", border: "1px solid var(--color-warning-border)" };
  }

  return { bgcolor: "transparent", color: "var(--color-muted)", border: "1px solid var(--color-border)" };
}

// The board endpoint only ever returns open (non-settled) expenses, so
// expense.status is always the same generic "not fully settled" value here —
// it carries no info about individual participant progress. Derive the
// user-facing chip from the participants instead, so it reflects reality.
function summarizeExpenseProgress(expense: GroupDebtExpense) {
  const total = expense.participants.length;
  const confirmed = expense.participants.filter((participant) => participant.status === "payment-confirmed").length;
  const submitted = expense.participants.filter((participant) => participant.status === "payment-submitted").length;

  if (expense.status === "settled" || (total > 0 && confirmed === total)) {
    return { label: "Settled", tone: "success" as const };
  }

  if (confirmed > 0) {
    return { label: `${confirmed}/${total} confirmed`, tone: "success" as const };
  }

  if (submitted > 0) {
    return { label: "Awaiting review", tone: "warning" as const };
  }

  return { label: "Awaiting payment", tone: "neutral" as const };
}

function getExpenseStatusChipSx(tone: "success" | "warning" | "neutral") {
  if (tone === "success") {
    return { bgcolor: "var(--color-success-soft-bg)", color: "var(--color-success)", border: "1px solid var(--color-success-border)" };
  }

  if (tone === "warning") {
    return { bgcolor: "var(--color-warning-soft-bg)", color: "var(--color-warning)", border: "1px solid var(--color-warning-border)" };
  }

  return { bgcolor: "var(--color-accent-soft-bg)", color: "var(--color-accent-soft-ink)", border: "1px solid var(--color-border)" };
}

function hasReviewAction(expense: GroupDebtExpense, participant: GroupDebtParticipant, currentUserId?: string) {
  return Boolean(currentUserId && expense.createdByUserId === currentUserId && participant.status === "payment-submitted");
}

function canModifyExpense(expense: GroupDebtExpense, currentUserId?: string) {
  const isCreator = Boolean(currentUserId && expense.createdByUserId === currentUserId);
  const hasSubmission = expense.participants.some((participant) => participant.status !== "pending");
  return isCreator && !hasSubmission;
}

const roundIconButtonSx = {
  width: 36,
  height: 36,
  borderRadius: "var(--radius-sm)",
  color: "var(--color-muted)",
  "&:hover": { bgcolor: "var(--color-surface-3)", color: "var(--color-ink)" },
};

const quickActionButtonSx = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  flexShrink: 0,
};

const fullWidthChipSx = {
  width: "100%",
  justifyContent: "center",
  "& .MuiChip-label": { width: "100%", textAlign: "center" as const },
};

const youTagSx = {
  display: "inline-flex",
  alignItems: "center",
  flexShrink: 0,
  padding: "2px 8px",
  borderRadius: "6px",
  fontSize: "11px",
  fontWeight: 600,
  lineHeight: 1.4,
  bgcolor: "var(--color-accent-soft-bg)",
  color: "var(--color-accent-soft-ink)",
};

export function GroupDebtWidget({ backendUrl, groupId, currentUserId, accessToken, onBoardChange }: GroupDebtWidgetProps) {
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

        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: "repeat(3, 1fr)",
            mb: 2,
            pt: 2,
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <Box>
            <Typography sx={microLabelSx}>Open</Typography>
            <Typography sx={monoStatSx}>{isLoading ? <Skeleton width={48} /> : summary.expenseCount}</Typography>
          </Box>
          <Box>
            <Typography sx={microLabelSx}>Waiting</Typography>
            <Typography sx={monoStatSx}>{isLoading ? <Skeleton width={48} /> : summary.pendingMyPayment}</Typography>
          </Box>
          <Box>
            <Typography sx={microLabelSx}>Review</Typography>
            <Typography sx={monoStatSx}>{isLoading ? <Skeleton width={48} /> : summary.awaitingReview}</Typography>
          </Box>
        </Box>

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
            {board.expenses.map((expense) => {
              const expenseProgress = summarizeExpenseProgress(expense);

              return (
              <Card
                key={expense.id}
                variant="outlined"
                onClick={() => setViewingExpenseId(expense.id)}
                sx={{
                  borderRadius: "var(--radius-md)",
                  borderColor: "var(--color-border)",
                  bgcolor: "var(--color-surface-2)",
                  cursor: "pointer",
                  boxShadow: "var(--shadow-sm)",
                  transition: "box-shadow 0.15s ease",
                  "&:hover": { boxShadow: "var(--shadow-lg)" },
                }}
              >
                <CardContent sx={{ p: 2.25 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "var(--color-ink)", lineHeight: 1.3 }}>
                        {expense.title}
                      </Typography>
                    </Box>
                    {canModifyExpense(expense, currentUserId) && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                        <IconButton
                          title="Edit"
                          onClick={(event) => {
                            event.stopPropagation();
                            openEditDialog(expense);
                          }}
                          sx={roundIconButtonSx}
                        >
                          <Pencil size={15} strokeWidth={2} />
                        </IconButton>
                        <IconButton
                          title="Delete"
                          onClick={(event) => {
                            event.stopPropagation();
                            setDeleteExpenseError(null);
                            setDeletingExpense(expense);
                          }}
                          sx={{ ...roundIconButtonSx, color: "var(--color-danger)", "&:hover": { bgcolor: "var(--color-danger-soft-bg)", color: "var(--color-danger)" } }}
                        >
                          <Trash2 size={15} strokeWidth={2} />
                        </IconButton>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
                    <Typography sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.375rem", color: "var(--color-warning)", letterSpacing: "-0.01em" }}>
                      {formatMoney(expense.totalAmount)}
                    </Typography>
                    <Chip label={expenseProgress.label} size="small" sx={getExpenseStatusChipSx(expenseProgress.tone)} />
                  </Box>

                  <Divider sx={{ my: 1.75, borderColor: "var(--color-border)" }} />

                  <Stack spacing={1.5}>
                    {expense.participants.map((participant) => {
                      const submitKey = `${expense.id}:${participant.userId}:submit`;
                      const approveKey = `${expense.id}:${participant.userId}:approve`;
                      const rejectKey = `${expense.id}:${participant.userId}:reject`;
                      const canSubmit = participant.isCurrentUser && participant.status === "pending";
                      const canReview = hasReviewAction(expense, participant, currentUserId);
                      const isWaiting = participant.isCurrentUser && participant.status === "payment-submitted";

                      return (
                        <Box key={participant.id} sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                          <AvatarUploader
                            src={resolveAvatarUrl(backendUrl, participant.avatarUrl)}
                            token={accessToken}
                            fallback={participant.name?.[0] || "?"}
                            size={32}
                            onUpload={noop}
                            onRemove={noop}
                          />
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--color-ink)" }} noWrap>
                              {participant.name}
                            </Typography>
                            {participant.isCurrentUser && (
                              <Box component="span" sx={youTagSx}>
                                You
                              </Box>
                            )}
                          </Box>

                          {canSubmit && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }} onClick={(event) => event.stopPropagation()}>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: "var(--color-muted)" }}>
                                {formatMoney(participant.shareAmount)}
                              </Typography>
                              <IconButton
                                title="Mark as paid"
                                disabled={activeAction === submitKey}
                                onClick={() =>
                                  void runAction(submitKey, () =>
                                    submitExpensePayment(backendUrl, expense.id, participant.userId, undefined, accessToken)
                                  )
                                }
                                sx={{ ...quickActionButtonSx, bgcolor: "var(--color-accent)", color: "var(--color-accent-contrast)", "&:hover": { bgcolor: "var(--color-accent)", filter: "brightness(0.92)" } }}
                              >
                                <CheckCircle2 size={15} strokeWidth={2.5} />
                              </IconButton>
                            </Box>
                          )}

                          {canReview && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }} onClick={(event) => event.stopPropagation()}>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: "var(--color-muted)" }}>
                                {formatMoney(participant.shareAmount)}
                              </Typography>
                              <IconButton
                                title="Approve"
                                disabled={activeAction === approveKey}
                                onClick={() =>
                                  void runAction(approveKey, () =>
                                    confirmExpensePayment(backendUrl, expense.id, participant.userId, accessToken)
                                  )
                                }
                                sx={{ ...quickActionButtonSx, bgcolor: "var(--color-success-soft-bg)", color: "var(--color-success)", "&:hover": { bgcolor: "var(--color-success-soft-bg)", filter: "brightness(0.92)" } }}
                              >
                                <CheckCircle2 size={14} strokeWidth={2.5} />
                              </IconButton>
                              <IconButton
                                title="Disapprove"
                                disabled={activeAction === rejectKey}
                                onClick={() =>
                                  void runAction(rejectKey, () =>
                                    rejectExpensePayment(backendUrl, expense.id, participant.userId, accessToken)
                                  )
                                }
                                sx={{ ...quickActionButtonSx, bgcolor: "var(--color-danger-soft-bg)", color: "var(--color-danger)", "&:hover": { bgcolor: "var(--color-danger-soft-bg)", filter: "brightness(0.92)" } }}
                              >
                                <X size={14} strokeWidth={2.5} />
                              </IconButton>
                            </Box>
                          )}

                          {isWaiting && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0, color: "var(--color-warning)" }}>
                              <Clock3 size={13} strokeWidth={2} />
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {formatMoney(participant.shareAmount)}
                              </Typography>
                            </Box>
                          )}

                          {!canSubmit && !canReview && !isWaiting && (
                            <Typography variant="caption" sx={{ fontWeight: 600, color: "var(--color-muted)", flexShrink: 0 }}>
                              {formatMoney(participant.shareAmount)}
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>
              );
            })}
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

      <Dialog
        open={Boolean(editingExpense)}
        onClose={() => (isSavingEdit ? undefined : setEditingExpense(null))}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "var(--color-ink)" }}>Edit expense</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Title"
            value={editForm.title}
            onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))}
            required
            fullWidth
          />
          <TextField
            label="Amount"
            type="number"
            value={editForm.totalAmount}
            onChange={(event) => setEditForm((current) => ({ ...current, totalAmount: event.target.value }))}
            required
            fullWidth
            slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
          />
          <TextField
            label="Description"
            value={editForm.note}
            onChange={(event) => setEditForm((current) => ({ ...current, note: event.target.value }))}
            fullWidth
            multiline
            rows={3}
          />
          {editError && <Alert severity="error">{editError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditingExpense(null)} disabled={isSavingEdit} sx={{ textTransform: "none", fontWeight: 700, color: "var(--color-ink)" }}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleSaveEdit()}
            disabled={isSavingEdit}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              bgcolor: "var(--color-accent)",
              color: "var(--color-accent-contrast)",
              "&:hover": { bgcolor: "var(--color-accent)", filter: "brightness(0.92)" },
            }}
          >
            {isSavingEdit ? "Saving..." : "Save changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deletingExpense)}
        onClose={() => (isDeletingExpense ? undefined : setDeletingExpense(null))}
        slotProps={{ paper: { sx: { borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "var(--color-ink)" }}>Delete {deletingExpense?.title ?? "this expense"}?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "var(--color-muted)" }}>
            This action can't be undone. The expense and its participant shares will be permanently removed.
          </DialogContentText>
          {deleteExpenseError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteExpenseError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeletingExpense(null)}
            disabled={isDeletingExpense}
            sx={{ textTransform: "none", fontWeight: 700, color: "var(--color-ink)" }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleDeleteExpense()}
            disabled={isDeletingExpense}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              bgcolor: "var(--color-danger)",
              color: "var(--color-accent-contrast)",
              "&:hover": { bgcolor: "var(--color-danger)", filter: "brightness(0.92)" },
            }}
          >
            {isDeletingExpense ? "Deleting..." : "Delete expense"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(viewingExpenseId)}
        onClose={() => setViewingExpenseId(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" } } }}
      >
        {(() => {
          const expense = board?.expenses.find((candidate) => candidate.id === viewingExpenseId);
          if (!expense) {
            return null;
          }

          const progress = summarizeExpenseProgress(expense);

          return (
            <>
                <DialogTitle sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5, pb: 1 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "1.15rem", color: "var(--color-ink)", lineHeight: 1.3 }}>
                      {expense.title}
                    </Typography>
                    {expense.description && (
                      <Typography variant="body2" sx={{ color: "var(--color-muted)", mt: 0.25 }}>
                        {expense.description}
                      </Typography>
                    )}
                  </Box>
                  <IconButton title="Close" onClick={() => setViewingExpenseId(null)} sx={{ ...roundIconButtonSx, flexShrink: 0 }}>
                    <X size={16} strokeWidth={2} />
                  </IconButton>
                </DialogTitle>

                <DialogContent sx={{ pt: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
                    <Typography sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.75rem", color: "var(--color-warning)" }}>
                      {formatMoney(expense.totalAmount)}
                    </Typography>
                    <Chip label={progress.label} size="small" sx={getExpenseStatusChipSx(progress.tone)} />
                  </Box>
                  <Typography variant="caption" sx={{ color: "var(--color-muted)", display: "block", mt: 0.5 }}>
                    Paid by {expense.paidByName}
                  </Typography>

                  <Divider sx={{ my: 2, borderColor: "var(--color-border)" }} />

                  <Typography sx={microLabelSx}>Split with</Typography>

                  <Stack spacing={1.25} sx={{ mt: 1.25 }}>
                    {expense.participants.map((participant) => {
                      const submitKey = `${expense.id}:${participant.userId}:submit`;
                      const approveKey = `${expense.id}:${participant.userId}:approve`;
                      const rejectKey = `${expense.id}:${participant.userId}:reject`;
                      const canSubmit = participant.isCurrentUser && participant.status === "pending";
                      const canReview = hasReviewAction(expense, participant, currentUserId);
                      const isWaiting = participant.isCurrentUser && participant.status === "payment-submitted";

                      return (
                        <Box key={participant.id} sx={{ bgcolor: "var(--color-surface-3)", borderRadius: "var(--radius-sm)", p: 1.75 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <AvatarUploader
                              src={resolveAvatarUrl(backendUrl, participant.avatarUrl)}
                              token={accessToken}
                              fallback={participant.name?.[0] || "?"}
                              size={34}
                              onUpload={noop}
                              onRemove={noop}
                            />
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: "var(--color-ink)" }} noWrap>
                                  {participant.name}
                                </Typography>
                                {participant.isCurrentUser && (
                                  <Box component="span" sx={youTagSx}>
                                    You
                                  </Box>
                                )}
                              </Box>
                              <Typography variant="caption" sx={{ color: "var(--color-muted)", display: "block" }}>
                                {formatMoney(participant.shareAmount)} due
                                {participant.comment ? ` · ${participant.comment}` : ""}
                              </Typography>
                            </Box>
                          </Box>

                          <Chip
                            label={getStatusLabel(participant.status)}
                            size="small"
                            icon={participant.status === "payment-confirmed" ? <CheckCircle2 size={14} strokeWidth={2} /> : undefined}
                            sx={{ mt: 1.5, ...fullWidthChipSx, ...getStatusChipSx(participant.status) }}
                          />

                          {canSubmit && (
                            <Button
                              fullWidth
                              disabled={activeAction === submitKey}
                              onClick={() =>
                                void runAction(submitKey, () =>
                                  submitExpensePayment(backendUrl, expense.id, participant.userId, undefined, accessToken)
                                )
                              }
                              sx={{
                                mt: 1.25,
                                textTransform: "none",
                                fontWeight: 700,
                                bgcolor: "var(--color-accent)",
                                color: "var(--color-accent-contrast)",
                                "&:hover": { bgcolor: "var(--color-accent)", filter: "brightness(0.92)" },
                              }}
                            >
                              I paid
                            </Button>
                          )}

                          {canReview && (
                            <Stack spacing={1} sx={{ mt: 1.25 }}>
                              <Button
                                fullWidth
                                disabled={activeAction === approveKey}
                                startIcon={<CheckCircle2 size={14} strokeWidth={2} />}
                                onClick={() =>
                                  void runAction(approveKey, () =>
                                    confirmExpensePayment(backendUrl, expense.id, participant.userId, accessToken)
                                  )
                                }
                                sx={{
                                  textTransform: "none",
                                  fontWeight: 700,
                                  bgcolor: "var(--color-success)",
                                  color: "var(--color-accent-contrast)",
                                  "&:hover": { bgcolor: "var(--color-success)", filter: "brightness(0.92)" },
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                fullWidth
                                variant="outlined"
                                disabled={activeAction === rejectKey}
                                startIcon={<X size={14} strokeWidth={2} />}
                                onClick={() =>
                                  void runAction(rejectKey, () =>
                                    rejectExpensePayment(backendUrl, expense.id, participant.userId, accessToken)
                                  )
                                }
                                sx={{
                                  textTransform: "none",
                                  fontWeight: 700,
                                  color: "var(--color-danger)",
                                  borderColor: "var(--color-danger-border)",
                                  "&:hover": { borderColor: "var(--color-danger)", bgcolor: "var(--color-danger-soft-bg)" },
                                }}
                              >
                                Disapprove
                              </Button>
                            </Stack>
                          )}

                          {isWaiting && (
                            <Box sx={{ mt: 1.25, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75, color: "var(--color-warning)" }}>
                              <Clock3 size={13} strokeWidth={2} />
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                Waiting for creator
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Stack>

                  {canModifyExpense(expense, currentUserId) && (
                    <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                      <Button
                        fullWidth
                        startIcon={<Pencil size={14} strokeWidth={2} />}
                        onClick={() => {
                          setViewingExpenseId(null);
                          openEditDialog(expense);
                        }}
                        sx={{ textTransform: "none", fontWeight: 700, bgcolor: "var(--color-surface-3)", color: "var(--color-ink)" }}
                      >
                        Edit
                      </Button>
                      <Button
                        fullWidth
                        startIcon={<Trash2 size={14} strokeWidth={2} />}
                        onClick={() => {
                          setViewingExpenseId(null);
                          setDeleteExpenseError(null);
                          setDeletingExpense(expense);
                        }}
                        sx={{ textTransform: "none", fontWeight: 700, bgcolor: "var(--color-danger-soft-bg)", color: "var(--color-danger)" }}
                      >
                        Delete
                      </Button>
                    </Box>
                  )}
                </DialogContent>
              </>
            );
          })()}
      </Dialog>
    </Card>
  );
}
