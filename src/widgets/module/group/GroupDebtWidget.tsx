import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
  Skeleton,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import {
  confirmExpensePayment,
  getGroupDebtBoard,
  rejectExpensePayment,
  submitExpensePayment,
  type GroupDebtBoard,
  type GroupDebtExpense,
  type GroupDebtParticipant,
} from "../../../shared/api/backend";
import { formatMoney } from "../../../shared/lib/format";

type GroupDebtWidgetProps = {
  backendUrl: string;
  groupId: string;
  currentUserId?: string;
  accessToken?: string;
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

function hasReviewAction(expense: GroupDebtExpense, participant: GroupDebtParticipant, currentUserId?: string) {
  return Boolean(currentUserId && expense.createdByUserId === currentUserId && participant.status === "payment-submitted");
}

export function GroupDebtWidget({ backendUrl, groupId, currentUserId, accessToken }: GroupDebtWidgetProps) {
  const [board, setBoard] = useState<GroupDebtBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const loadBoard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const snapshot = await getGroupDebtBoard(backendUrl, groupId, accessToken);
      setBoard(snapshot);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load current debts.");
      setBoard(null);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, backendUrl, groupId]);

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

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Current debts
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Track pending payments and creator approvals for this group.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ReceiptLongIcon />}
            onClick={() => void loadBoard()}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Refresh
          </Button>
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            mb: 2,
          }}
        >
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                Open expenses
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {isLoading ? <Skeleton width={48} /> : summary.expenseCount}
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                Waiting on you
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {isLoading ? <Skeleton width={48} /> : summary.pendingMyPayment}
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                Awaiting review
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {isLoading ? <Skeleton width={48} /> : summary.awaitingReview}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {errorMessage && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {isLoading ? (
          <Stack spacing={1.5}>
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index} variant="outlined" sx={{ borderRadius: 2 }}>
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
              <Card key={expense.id} variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 2 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        {expense.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {expense.description}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
                        Paid by {expense.paidByName}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {formatMoney(expense.totalAmount)}
                      </Typography>
                      <Chip label={expense.status} size="small" variant="outlined" sx={{ textTransform: "capitalize" }} />
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={1.25}>
                    {expense.participants.map((participant) => {
                      const submitKey = `${expense.id}:${participant.userId}:submit`;
                      const approveKey = `${expense.id}:${participant.userId}:approve`;
                      const rejectKey = `${expense.id}:${participant.userId}:reject`;
                      const canSubmit = participant.isCurrentUser && participant.status === "pending";
                      const canReview = hasReviewAction(expense, participant, currentUserId);

                      return (
                        <Box
                          key={participant.id}
                          sx={{
                            display: "grid",
                            gap: 1.5,
                            gridTemplateColumns: { xs: "1fr", md: "1.4fr auto auto" },
                            alignItems: { md: "center" },
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: "rgba(15, 23, 42, 0.03)",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                            <Avatar sx={{ bgcolor: "#4f46e5", width: 36, height: 36, fontSize: "0.9rem" }}>
                              {participant.name?.[0] || "?"}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {participant.name}
                                </Typography>
                                {participant.isCurrentUser && <Chip label="You" size="small" sx={{ height: 22 }} />}
                              </Box>
                              <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                                {formatMoney(participant.shareAmount)} due
                                {participant.comment ? ` · ${participant.comment}` : ""}
                              </Typography>
                            </Box>
                          </Box>

                          <Chip
                            label={getStatusLabel(participant.status)}
                            color={getStatusTone(participant.status) as "success" | "warning" | "default"}
                            variant={participant.status === "pending" ? "outlined" : "filled"}
                            size="small"
                            icon={participant.status === "payment-confirmed" ? <CheckCircleIcon /> : undefined}
                            sx={{ justifySelf: { md: "end" } }}
                          />

                          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: { md: "flex-end" } }}>
                            {canSubmit && (
                              <Button
                                variant="contained"
                                size="small"
                                disabled={activeAction === submitKey}
                                onClick={() =>
                                  void runAction(submitKey, () =>
                                    submitExpensePayment(backendUrl, expense.id, participant.userId, undefined, accessToken)
                                  )
                                }
                                sx={{ textTransform: "none", fontWeight: 700 }}
                              >
                                I paid
                              </Button>
                            )}

                            {canReview && (
                              <>
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  disabled={activeAction === approveKey}
                                  startIcon={<CheckCircleIcon />}
                                  onClick={() =>
                                    void runAction(approveKey, () =>
                                      confirmExpensePayment(backendUrl, expense.id, participant.userId, accessToken)
                                    )
                                  }
                                  sx={{ textTransform: "none", fontWeight: 700 }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  disabled={activeAction === rejectKey}
                                  startIcon={<CancelIcon />}
                                  onClick={() =>
                                    void runAction(rejectKey, () =>
                                      rejectExpensePayment(backendUrl, expense.id, participant.userId, accessToken)
                                    )
                                  }
                                  sx={{ textTransform: "none", fontWeight: 700 }}
                                >
                                  Disapprove
                                </Button>
                              </>
                            )}

                            {participant.status === "payment-submitted" && !canReview && (
                              <Chip icon={<PendingActionsIcon />} label="Waiting for creator" size="small" />
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <PendingActionsIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.5 }}>
              No unsettled debts
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Everything in this group has been settled already.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}