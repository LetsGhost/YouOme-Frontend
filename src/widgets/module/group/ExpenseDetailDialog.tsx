import { CheckCircle2, Clock3, Pencil, Trash2, X } from "lucide-react";
import { Box, Button, Chip, Dialog, DialogContent, DialogTitle, Divider, IconButton, Stack, Typography } from "@mui/material";

import { resolveAvatarUrl, type GroupDebtExpense } from "../../../shared/api/backend";
import { formatMoney } from "../../../shared/lib/format";
import { AvatarUploader } from "../../avatar/AvatarUploader";
import {
  canModifyExpense,
  fullWidthChipSx,
  getApproveKey,
  getExpenseStatusChipSx,
  getRejectKey,
  getStatusChipSx,
  getStatusLabel,
  getSubmitKey,
  hasReviewAction,
  microLabelSx,
  noop,
  roundIconButtonSx,
  summarizeExpenseProgress,
  youTagSx,
} from "./groupDebtWidgetHelpers";

export function ExpenseDetailDialog({
  expense,
  backendUrl,
  accessToken,
  currentUserId,
  activeAction,
  onClose,
  onEdit,
  onDelete,
  onSubmitPayment,
  onApprovePayment,
  onRejectPayment,
}: {
  expense: GroupDebtExpense | undefined;
  backendUrl: string;
  accessToken?: string;
  currentUserId?: string;
  activeAction: string | null;
  onClose: () => void;
  onEdit: (expense: GroupDebtExpense) => void;
  onDelete: (expense: GroupDebtExpense) => void;
  onSubmitPayment: (expense: GroupDebtExpense, participantUserId: string) => void;
  onApprovePayment: (expense: GroupDebtExpense, participantUserId: string) => void;
  onRejectPayment: (expense: GroupDebtExpense, participantUserId: string) => void;
}) {
  return (
    <Dialog
      open={Boolean(expense)}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" } } }}
    >
      {expense &&
        (() => {
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
                <IconButton title="Close" onClick={onClose} sx={{ ...roundIconButtonSx, flexShrink: 0 }}>
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
                    const submitKey = getSubmitKey(expense.id, participant.userId);
                    const approveKey = getApproveKey(expense.id, participant.userId);
                    const rejectKey = getRejectKey(expense.id, participant.userId);
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
                            onClick={() => onSubmitPayment(expense, participant.userId)}
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
                              onClick={() => onApprovePayment(expense, participant.userId)}
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
                              onClick={() => onRejectPayment(expense, participant.userId)}
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
                      onClick={() => onEdit(expense)}
                      sx={{ textTransform: "none", fontWeight: 700, bgcolor: "var(--color-surface-3)", color: "var(--color-ink)" }}
                    >
                      Edit
                    </Button>
                    <Button
                      fullWidth
                      startIcon={<Trash2 size={14} strokeWidth={2} />}
                      onClick={() => onDelete(expense)}
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
  );
}
