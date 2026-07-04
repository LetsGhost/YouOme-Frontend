import { Check, CheckCircle2, Clock3, Pencil, Trash2, X } from "lucide-react";
import { Box, Card, CardContent, Chip, Divider, IconButton, Stack, Typography } from "@mui/material";

import { resolveAvatarUrl, type GroupDebtExpense } from "../../../shared/api/backend";
import { formatMoney } from "../../../shared/lib/format";
import { AvatarUploader } from "../../avatar/AvatarUploader";
import {
  canModifyExpense,
  getApproveKey,
  getExpenseStatusChipSx,
  getRejectKey,
  getSubmitKey,
  hasReviewAction,
  noop,
  quickActionButtonSx,
  roundIconButtonSx,
  summarizeExpenseProgress,
  youTagSx,
} from "./groupDebtWidgetHelpers";

export function ExpenseListCard({
  expense,
  backendUrl,
  accessToken,
  currentUserId,
  activeAction,
  onView,
  onEdit,
  onDelete,
  onSubmitPayment,
  onApprovePayment,
  onRejectPayment,
}: {
  expense: GroupDebtExpense;
  backendUrl: string;
  accessToken?: string;
  currentUserId?: string;
  activeAction: string | null;
  onView: (expenseId: string) => void;
  onEdit: (expense: GroupDebtExpense) => void;
  onDelete: (expense: GroupDebtExpense) => void;
  onSubmitPayment: (expense: GroupDebtExpense, participantUserId: string) => void;
  onApprovePayment: (expense: GroupDebtExpense, participantUserId: string) => void;
  onRejectPayment: (expense: GroupDebtExpense, participantUserId: string) => void;
}) {
  const expenseProgress = summarizeExpenseProgress(expense);

  return (
    <Card
      variant="outlined"
      onClick={() => onView(expense.id)}
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
                  onEdit(expense);
                }}
                sx={roundIconButtonSx}
              >
                <Pencil size={15} strokeWidth={2} />
              </IconButton>
              <IconButton
                title="Delete"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(expense);
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
            const submitKey = getSubmitKey(expense.id, participant.userId);
            const approveKey = getApproveKey(expense.id, participant.userId);
            const rejectKey = getRejectKey(expense.id, participant.userId);
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
                      onClick={() => onSubmitPayment(expense, participant.userId)}
                      sx={{ ...quickActionButtonSx, bgcolor: "var(--color-accent)", color: "var(--color-accent-contrast)", "&:hover": { bgcolor: "var(--color-accent)", filter: "brightness(0.92)" } }}
                    >
                      <Check size={15} strokeWidth={2.5} />
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
                      onClick={() => onApprovePayment(expense, participant.userId)}
                      sx={{ ...quickActionButtonSx, bgcolor: "var(--color-success-soft-bg)", color: "var(--color-success)", "&:hover": { bgcolor: "var(--color-success-soft-bg)", filter: "brightness(0.92)" } }}
                    >
                      <CheckCircle2 size={14} strokeWidth={2.5} />
                    </IconButton>
                    <IconButton
                      title="Disapprove"
                      disabled={activeAction === rejectKey}
                      onClick={() => onRejectPayment(expense, participant.userId)}
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
}
