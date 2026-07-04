import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Alert, Avatar, Box, Chip, Dialog, DialogContent, DialogTitle, Divider, IconButton, Stack, Typography } from "@mui/material";

import { getExpense, type ExpenseParticipant, type GroupExpense, type GroupMember } from "../../shared/api/backend";
import { formatMoney, formatTimestamp } from "../../shared/lib/format";
import { LoadingBlock } from "../../shared/ui/InlineSpinner";
import {
  fullWidthChipSx,
  getExpenseStatusChipSx,
  getStatusChipSx,
  getStatusLabel,
  microLabelSx,
  roundIconButtonSx,
  youTagSx,
} from "../../widgets/module/group/groupDebtWidgetHelpers";
import { getMemberLabel } from "./groupDetailsHelpers";
import { MemberAvatar } from "./MemberAvatar";

function resolvePaidByName(paidBy: GroupExpense["paidBy"], members: GroupMember[]) {
  if (!paidBy) {
    return "Unknown";
  }

  if (typeof paidBy === "string") {
    const member = members.find((candidate) => candidate.id === paidBy);
    return member ? getMemberLabel(member) : paidBy;
  }

  if (paidBy.name) {
    return paidBy.name;
  }

  const member = members.find((candidate) => candidate.id === paidBy.id);
  return member ? getMemberLabel(member) : paidBy.id;
}

function summarizeProgress(participants: ExpenseParticipant[], expenseStatus?: string) {
  const total = participants.length;
  const confirmed = participants.filter((participant) => participant.status === "payment-confirmed").length;
  const submitted = participants.filter((participant) => participant.status === "payment-submitted").length;

  if (expenseStatus === "settled" || (total > 0 && confirmed === total)) {
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

export function ExpenseViewDialog({
  expense,
  members,
  backendUrl,
  accessToken,
  currentUserId,
  onClose,
}: {
  expense: GroupExpense | null;
  members: GroupMember[];
  backendUrl: string;
  accessToken?: string;
  currentUserId?: string;
  onClose: () => void;
}) {
  const [participants, setParticipants] = useState<ExpenseParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!expense) {
      setParticipants([]);
      setErrorMessage(null);
      return;
    }

    let isMounted = true;

    const loadParticipants = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await getExpense(backendUrl, expense.id, accessToken);
        if (isMounted) {
          setParticipants(data.participants);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "Failed to load expense details.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadParticipants();

    return () => {
      isMounted = false;
    };
  }, [expense, backendUrl, accessToken]);

  const progress = summarizeProgress(participants, expense?.status);

  return (
    <Dialog
      open={Boolean(expense)}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" } } }}
    >
      {expense && (
        <>
          <DialogTitle sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5, pb: 1 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "1.15rem", color: "var(--color-ink)", lineHeight: 1.3 }}>
                {expense.title || expense.description || "Expense"}
              </Typography>
              {expense.description && expense.description !== expense.title && (
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
                {formatMoney(expense.amount ?? expense.totalAmount)}
              </Typography>
              {!isLoading && <Chip label={progress.label} size="small" sx={getExpenseStatusChipSx(progress.tone)} />}
            </Box>
            <Typography variant="caption" sx={{ color: "var(--color-muted)", display: "block", mt: 0.5 }}>
              Paid by {resolvePaidByName(expense.paidBy, members)}
              {expense.date ? ` · ${formatTimestamp(expense.date)}` : ""}
            </Typography>

            {errorMessage && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Divider sx={{ my: 2, borderColor: "var(--color-border)" }} />

            <Typography sx={microLabelSx}>Split with</Typography>

            {isLoading ? (
              <Box sx={{ pt: 1.5 }}>
                <LoadingBlock label="Loading participants…" />
              </Box>
            ) : (
              <Stack spacing={1.25} sx={{ mt: 1.25 }}>
                {participants.map((participant) => {
                  const member = members.find((candidate) => candidate.id === participant.userId);
                  const isCurrentUser = participant.userId === currentUserId;

                  return (
                    <Box key={participant.userId} sx={{ bgcolor: "var(--color-surface-3)", borderRadius: "var(--radius-sm)", p: 1.75 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        {member ? (
                          <MemberAvatar backendUrl={backendUrl} token={accessToken} member={member} size={34} />
                        ) : (
                          <Avatar sx={{ width: 34, height: 34 }}>?</Avatar>
                        )}
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: "var(--color-ink)" }} noWrap>
                              {member ? getMemberLabel(member) : participant.userId}
                            </Typography>
                            {isCurrentUser && (
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
                        sx={{ mt: 1.5, ...fullWidthChipSx, ...getStatusChipSx(participant.status) }}
                      />

                      {(participant.submittedAt || participant.confirmedAt || participant.paidAt) && (
                        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.25 }}>
                          {participant.paidAt && (
                            <Typography variant="caption" sx={{ color: "var(--color-muted)" }}>
                              Paid {formatTimestamp(participant.paidAt)}
                            </Typography>
                          )}
                          {participant.submittedAt && (
                            <Typography variant="caption" sx={{ color: "var(--color-muted)" }}>
                              Submitted {formatTimestamp(participant.submittedAt)}
                            </Typography>
                          )}
                          {participant.confirmedAt && (
                            <Typography variant="caption" sx={{ color: "var(--color-muted)" }}>
                              Confirmed {formatTimestamp(participant.confirmedAt)}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  );
                })}

                {participants.length === 0 && !errorMessage && (
                  <Typography variant="body2" sx={{ color: "var(--color-muted)", textAlign: "center", py: 1.5 }}>
                    No participants recorded for this expense.
                  </Typography>
                )}
              </Stack>
            )}
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}
