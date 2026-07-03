import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronDown, ChevronUp, Plus, Users, TrendingUp, Settings, TrendingDown, Wallet } from "lucide-react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  Skeleton,
  MenuItem,
  Collapse,
  Pagination,
  useMediaQuery,
  useTheme,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

import { useAppState } from "../../app/AppStateContext";
import {
  createExpense,
  getGroup,
  listGroupExpenses,
  listGroupMembers,
  resolveAvatarUrl,
  type Group,
  type GroupDebtBoard,
  type GroupMember,
  type PaginatedGroupExpenses,
} from "../../shared/api/backend";
import { formatMoney, formatTimestamp } from "../../shared/lib/format";
import { GroupDebtWidget } from "../../widgets/module/group/GroupDebtWidget";
import { AvatarUploader } from "../../widgets/avatar/AvatarUploader";

const noop = async () => {
  void 0;
};

const EXPENSES_PAGE_SIZE = 10;

type SplitType = "equal" | "custom" | "percentage";

type ExpenseDraft = {
  title: string;
  amount: string;
  paidBy: string;
  description: string;
  splitType: SplitType;
  participantIds: string[];
  participantShares: Record<string, string>;
  chargeSameAmount: boolean;
};

const microLabelSx = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
};

function getMemberLabel(member: GroupMember) {
  return member.name || member.email || member.id;
}

function toCents(value: number) {
  return Math.round(value * 100);
}

function buildEqualShares(totalAmount: number, participantIds: string[], chargeSameAmount: boolean) {
  const totalCents = toCents(totalAmount);
  const count = participantIds.length;

  if (count === 0) {
    return new Map<string, number>();
  }

  const shares = new Map<string, number>();

  if (chargeSameAmount) {
    const equalCents = Math.round(totalCents / count);
    participantIds.forEach((participantId) => {
      shares.set(participantId, equalCents / 100);
    });
    return shares;
  }

  const baseShare = Math.floor(totalCents / count);
  let remainder = totalCents - baseShare * count;

  participantIds.forEach((participantId) => {
    const extraCent = remainder > 0 ? 1 : 0;
    shares.set(participantId, (baseShare + extraCent) / 100);
    remainder -= extraCent;
  });

  return shares;
}

function seedParticipantShares(totalAmount: number, participantIds: string[], splitType: SplitType) {
  if (participantIds.length === 0) {
    return {};
  }

  if (splitType === "percentage") {
    const base = (100 / (participantIds.length + 1)).toFixed(2);
    return participantIds.reduce<Record<string, string>>((result, participantId) => {
      result[participantId] = base;
      return result;
    }, {});
  }

  const equalShare = (totalAmount / (participantIds.length + 1)).toFixed(2);
  return participantIds.reduce<Record<string, string>>((result, participantId) => {
    result[participantId] = equalShare;
    return result;
  }, {});
}

function getParticipantBreakdown(
  totalAmount: number,
  splitType: SplitType,
  participantIds: string[],
  participantShares: Record<string, string>,
  paidById: string,
  chargeSameAmount: boolean = false
) {
  if (participantIds.length === 0) {
    return { error: "Add at least one participant." } as const;
  }

  if (splitType === "equal") {
    return {
      shares: buildEqualShares(totalAmount, paidById ? [paidById, ...participantIds] : participantIds, chargeSameAmount),
    } as const;
  }

  if (splitType === "percentage") {
    const totalCents = toCents(totalAmount);
    const shares = new Map<string, number>();
    let selectedCents = 0;
    let totalPercentage = 0;

    for (const participantId of participantIds) {
      const percentage = Number(participantShares[participantId] ?? 0);

      if (!Number.isFinite(percentage) || percentage < 0) {
        return { error: "Enter a valid percentage for each participant." } as const;
      }

      totalPercentage += percentage;

      const roundedCents = Math.round((totalCents * percentage) / 100);
      shares.set(participantId, roundedCents / 100);
      selectedCents += roundedCents;
    }

    if (totalPercentage > 100.01) {
      return { error: "Percentages cannot exceed 100%." } as const;
    }

    const payerCents = totalCents - selectedCents;

    if (payerCents < 0) {
      return { error: "Percentages cannot exceed the total amount." } as const;
    }

    if (paidById) {
      shares.set(paidById, payerCents / 100);
    }

    return { shares } as const;
  }

  const shares = new Map<string, number>();
  const totalCents = toCents(totalAmount);
  let selectedCents = 0;

  for (const participantId of participantIds) {
    const shareValue = Number(participantShares[participantId]);

    if (!Number.isFinite(shareValue) || shareValue < 0) {
      return { error: "Enter a valid share for each participant." } as const;
    }

    const roundedCents = toCents(shareValue);
    shares.set(participantId, roundedCents / 100);
    selectedCents += roundedCents;
  }

  const payerCents = totalCents - selectedCents;

  if (payerCents < 0) {
    return { error: "Custom shares cannot exceed the total amount." } as const;
  }

  if (paidById) {
    shares.set(paidById, payerCents / 100);
  }

  return { shares } as const;
}

export function GroupDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { backendUrl, currentUser, session } = useAppState();
  const theme = useTheme();
  const isPhoneScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [group, setGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [debtBoard, setDebtBoard] = useState<GroupDebtBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [membersExpanded, setMembersExpanded] = useState(false);
  const [expensesExpanded, setExpensesExpanded] = useState(false);
  const [expensesData, setExpensesData] = useState<PaginatedGroupExpenses | null>(null);
  const [expensesPageNum, setExpensesPageNum] = useState(1);
  const [isExpensesLoading, setIsExpensesLoading] = useState(true);
  const [expenseData, setExpenseData] = useState<ExpenseDraft>({
    title: "",
    amount: "",
    paidBy: "",
    description: "",
    splitType: "equal",
    participantIds: [],
    participantShares: {},
    chargeSameAmount: false,
  });

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
          setExpenseData((current) => ({
            ...current,
            paidBy:
              current.paidBy ||
              memberList.find((member) => member.email === currentUser?.email)?.id ||
              memberList[0]?.id ||
              snapshot.members?.find((member) => member.email === currentUser?.email)?.id ||
              snapshot.members?.[0]?.id ||
              "",
          }));
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
    });
    setShowExpenseDialog(true);
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
            participants: participantIds.map((participantId) => ({
              userId: participantId,
              shareAmount: breakdown.shares.get(participantId) ?? 0,
            })),
          },
          session?.accessToken
        );

        const refreshed = await getGroup(backendUrl, id, session?.accessToken);
        setGroup(refreshed);
        setExpensesPageNum(1);
        void loadExpensesPage(1);
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
        });
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to create expense.");
      }
    })();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      {/* Header with Back Button */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 2,
          pb: 2,
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <IconButton onClick={() => navigate("/groups")} sx={{ color: "var(--color-muted)", "&:hover": { color: "var(--color-ink)" } }}>
            <ChevronLeft size={22} strokeWidth={2} />
          </IconButton>
          {!isLoading && (
            <AvatarUploader
              src={resolveAvatarUrl(backendUrl, group?.avatarUrl)}
              token={session?.accessToken}
              fallback={<Users size={24} strokeWidth={2} />}
              size={56}
              shape="rounded"
              onUpload={noop}
              onRemove={noop}
            />
          )}
          <Box sx={{ minWidth: 0 }}>
            {isLoading ? (
              <Skeleton variant="text" width={260} height={42} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 700, color: "var(--color-ink)", fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
                {group?.name || "Group"}
              </Typography>
            )}
            {isLoading ? (
              <Skeleton variant="text" width={220} />
            ) : (
              <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
                {group?.description || "No description provided."}
              </Typography>
            )}
          </Box>
        </Box>

        <Button
          variant="outlined"
          startIcon={<Settings size={16} strokeWidth={2} />}
          onClick={() => navigate(`/groups/${id}/settings`)}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            whiteSpace: "nowrap",
            borderColor: "var(--color-border)",
            color: "var(--color-ink)",
          }}
        >
          Settings
        </Button>
      </Box>

      {/* Quick Stats */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
        }}
      >
        <Box
          sx={{
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-warning-border)",
            bgcolor: "var(--color-warning-soft-bg)",
            p: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
            <TrendingDown size={14} strokeWidth={2} color="var(--color-warning)" />
            <Typography sx={{ ...microLabelSx, color: "var(--color-warning)" }}>You Owe</Typography>
          </Box>
          <Typography sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.35rem", color: "var(--color-warning)" }}>
            {formatMoney(youOwe)}
          </Typography>
        </Box>

        <Box
          sx={{
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-success-border)",
            bgcolor: "var(--color-success-soft-bg)",
            p: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
            <TrendingUp size={14} strokeWidth={2} color="var(--color-success)" />
            <Typography sx={{ ...microLabelSx, color: "var(--color-success)" }}>Owed to You</Typography>
          </Box>
          <Typography sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.35rem", color: "var(--color-success)" }}>
            {formatMoney(owedToYou)}
          </Typography>
        </Box>
      </Box>

      <Button
        startIcon={<Plus size={18} strokeWidth={2} />}
        onClick={openExpenseDialog}
        fullWidth
        sx={{
          bgcolor: "var(--color-accent)",
          color: "var(--color-accent-contrast)",
          p: 1.5,
          fontWeight: 700,
          textTransform: "none",
          fontSize: "1rem",
          "&:hover": {
            bgcolor: "var(--color-accent)",
            filter: "brightness(0.92)",
          },
        }}
      >
        Add Expense
      </Button>

      <GroupDebtWidget
        backendUrl={backendUrl}
        groupId={id || ""}
        currentUserId={currentUser?.id}
        accessToken={session?.accessToken}
        onBoardChange={setDebtBoard}
      />

      {/* Recent Expenses */}
      <Card sx={{ borderRadius: "var(--radius-md)" }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box
            onClick={() => setExpensesExpanded((current) => !current)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
              <Wallet size={18} strokeWidth={2} color="var(--color-accent)" />
              <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--color-ink)" }}>
                Recent Expenses
              </Typography>
              <Chip
                label={totalExpensesCount}
                size="small"
                sx={{ bgcolor: "var(--color-accent-soft-bg)", color: "var(--color-accent-soft-ink)", fontWeight: 700 }}
              />
            </Box>
            <IconButton size="small" sx={{ color: "var(--color-muted)" }}>
              {expensesExpanded ? <ChevronUp size={20} strokeWidth={2} /> : <ChevronDown size={20} strokeWidth={2} />}
            </IconButton>
          </Box>

          <Collapse in={expensesExpanded}>
            <Box sx={{ pt: 2 }}>
              {isExpensesLoading && expenses.length === 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} variant="rounded" height={58} sx={{ borderRadius: "var(--radius-md)" }} />
                  ))}
                </Box>
              ) : expenses.length > 0 ? (
                <>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, opacity: isExpensesLoading ? 0.6 : 1 }}>
                    {expenses.map((expense) => (
                      <Box
                        key={expense.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                          p: 1.5,
                          borderRadius: "var(--radius-md)",
                          bgcolor: "var(--color-surface-2)",
                          border: "1px solid var(--color-border)",
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "var(--color-ink)" }} noWrap>
                            {expense.description || "Expense"}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "var(--color-muted)", display: "block" }}>
                            {expense.date ? formatTimestamp(expense.date) : "Unknown date"}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            fontFamily: "var(--font-mono)",
                            fontWeight: 700,
                            color: "var(--color-accent)",
                            flexShrink: 0,
                          }}
                        >
                          {formatMoney(expense.amount)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {expensesData && expensesData.totalPages > 1 && (
                    <Box sx={{ display: "flex", justifyContent: "center", pt: 2 }}>
                      <Pagination
                        count={expensesData.totalPages}
                        page={expensesPageNum}
                        onChange={(_event, value) => setExpensesPageNum(value)}
                        size="small"
                        siblingCount={isPhoneScreen ? 0 : 1}
                        boundaryCount={1}
                        disabled={isExpensesLoading}
                      />
                    </Box>
                  )}
                </>
              ) : (
                <Typography variant="body2" sx={{ color: "var(--color-muted)", textAlign: "center", py: 2 }}>
                  No expenses found for this group.
                </Typography>
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* Members Section */}
      <Card sx={{ borderRadius: "var(--radius-md)" }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box
            onClick={() => setMembersExpanded((current) => !current)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Users size={18} strokeWidth={2} color="var(--color-accent)" />
              <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--color-ink)" }}>
                Members
              </Typography>
              <Chip
                label={members.length}
                size="small"
                sx={{ bgcolor: "var(--color-accent-soft-bg)", color: "var(--color-accent-soft-ink)", fontWeight: 700 }}
              />
            </Box>
            <IconButton size="small" sx={{ color: "var(--color-muted)" }}>
              {membersExpanded ? <ChevronUp size={20} strokeWidth={2} /> : <ChevronDown size={20} strokeWidth={2} />}
            </IconButton>
          </Box>

          <Collapse in={membersExpanded}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
              {members.map((member) => (
                <Box
                  key={member.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1.5,
                    borderRadius: "var(--radius-md)",
                    bgcolor: "var(--color-surface-2)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <AvatarUploader
                    src={resolveAvatarUrl(backendUrl, member.avatarUrl)}
                    token={session?.accessToken}
                    fallback={member.avatar || member.name?.[0] || "?"}
                    size={40}
                    onUpload={noop}
                    onRemove={noop}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "var(--color-ink)" }}>
                      {member.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "var(--color-muted)" }}>
                      {member.email || "No email available"}
                    </Typography>
                  </Box>
                  {(member.id === currentUser?.id || member.email === currentUser?.email) && (
                    <Chip
                      label="You"
                      size="small"
                      sx={{ bgcolor: "var(--color-accent-soft-bg)", color: "var(--color-accent-soft-ink)" }}
                    />
                  )}
                </Box>
              ))}
              {members.length === 0 && !isLoading && (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Users size={48} strokeWidth={1.8} color="var(--color-muted-3)" style={{ marginBottom: 8 }} />
                  <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
                    No members found in this group.
                  </Typography>
                </Box>
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* Add Expense Dialog */}
      <Dialog
        open={showExpenseDialog}
        onClose={() => setShowExpenseDialog(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isPhoneScreen}
        slotProps={{
          paper: {
            sx: isPhoneScreen ? undefined : { borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--color-ink)" }}>Add Expense</DialogTitle>
        <form onSubmit={handleCreateExpense}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, py: 2 }}>
            <TextField
              label="Expense Title"
              fullWidth
              placeholder="e.g., Groceries, Rent"
              value={expenseData.title}
              onChange={(e) => setExpenseData({ ...expenseData, title: e.target.value })}
              required
            />
            <TextField
              label="Amount"
              fullWidth
              type="number"
              placeholder="0.00"
              slotProps={{ htmlInput: { step: "0.01", min: "0" } }}
              value={expenseData.amount}
              onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
              required
            />
            <TextField
              label="Paid By"
              select
              fullWidth
              value={expenseData.paidBy}
              onChange={(e) => {
                const paidBy = e.target.value;
                const nextParticipantIds = members.filter((member) => member.id !== paidBy).map((member) => member.id);

                setExpenseData((current) => ({
                  ...current,
                  paidBy,
                  participantIds: nextParticipantIds,
                  participantShares: current.splitType === "equal" ? {} : seedParticipantShares(Number(current.amount) || 0, nextParticipantIds, current.splitType),
                }));
              }}
              variant="outlined"
            >
              <MenuItem value={currentUser?.id || ""}>You</MenuItem>
              {members
                .filter((member) => member.id !== currentUser?.id)
                .map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.name}
                  </MenuItem>
                ))}
            </TextField>
            <TextField
              label="Split"
              select
              fullWidth
              value={expenseData.splitType}
              onChange={(e) => {
                const splitType = e.target.value as SplitType;
                const participantIds = expenseData.participantIds.filter((participantId) => participantId !== expenseData.paidBy);

                setExpenseData((current) => ({
                  ...current,
                  splitType,
                  participantShares:
                    splitType === "equal"
                      ? {}
                      : seedParticipantShares(Number(current.amount) || 0, participantIds, splitType),
                }));
              }}
            >
              <MenuItem value="equal">Equal split</MenuItem>
              <MenuItem value="percentage">By percentage</MenuItem>
              <MenuItem value="custom">Custom amounts</MenuItem>
            </TextField>
            {equalSplitHasRemainder && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={expenseData.chargeSameAmount}
                    onChange={(e) =>
                      setExpenseData((current) => ({
                        ...current,
                        chargeSameAmount: e.target.checked,
                      }))
                    }
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--color-ink)" }}>
                      Charge everyone the same rounded amount
                    </Typography>
                    <Typography variant="caption" sx={{ color: "var(--color-muted)" }}>
                      {expenseData.chargeSameAmount
                        ? "Everyone pays the same rounded share; you absorb the rounding difference yourself."
                        : "Off: shares are rounded fairly so they sum to the exact total (some people may pay 1 cent more than others)."}
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: "flex-start", ml: 0 }}
              />
            )}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--color-ink)" }}>
                Who participated?
              </Typography>
              <Typography variant="caption" sx={{ color: "var(--color-muted)" }}>
                Pick everyone who should owe part of this expense. The payer's share is added automatically.
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {members.filter((member) => member.id !== expenseData.paidBy).map((member) => {
                  const selected = expenseData.participantIds.includes(member.id);

                  return (
                    <Chip
                      key={member.id}
                      label={getMemberLabel(member)}
                      clickable
                      variant={selected ? "filled" : "outlined"}
                      sx={
                        selected
                          ? { bgcolor: "var(--color-accent)", color: "var(--color-accent-contrast)" }
                          : { borderColor: "var(--color-border)", color: "var(--color-ink)" }
                      }
                      onClick={() => {
                        setExpenseData((current) => {
                          const participantIds = current.participantIds.includes(member.id)
                            ? current.participantIds.filter((participantId) => participantId !== member.id)
                            : [...current.participantIds, member.id];

                          return {
                            ...current,
                            participantIds,
                            participantShares:
                              current.splitType === "equal"
                                ? {}
                                : seedParticipantShares(Number(current.amount) || 0, participantIds, current.splitType),
                          };
                        });
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--color-ink)" }}>
                Split preview
              </Typography>
              {previewMembers.length > 0 && Number(expenseData.amount) > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {expenseData.splitType === "equal" &&
                    previewMembers.map((member) => (
                      <Box
                        key={member.id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 2,
                          bgcolor: member.id === expenseData.paidBy ? "var(--color-accent-soft-bg)" : "var(--color-surface-2)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-sm)",
                          px: 1.5,
                          py: 1,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--color-ink)" }}>
                          {member.id === expenseData.paidBy ? `${getMemberLabel(member)} (paid upfront)` : getMemberLabel(member)}
                        </Typography>
                        <Typography sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--color-ink)" }}>
                          {formatMoney(previewShares.get(member.id) ?? 0)}
                        </Typography>
                      </Box>
                    ))}

                  {expenseData.splitType === "percentage" && previewMembers.map((member) => (
                    <Box
                      key={member.id}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 120px 120px",
                        gap: 1,
                        alignItems: "center",
                        bgcolor: member.id === expenseData.paidBy ? "var(--color-accent-soft-bg)" : "var(--color-surface-2)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-sm)",
                        px: 1.5,
                        py: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--color-ink)" }}>
                        {member.id === expenseData.paidBy ? `${getMemberLabel(member)} (paid upfront)` : getMemberLabel(member)}
                      </Typography>
                      {member.id === expenseData.paidBy ? (
                        <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
                          Included automatically
                        </Typography>
                      ) : (
                        <TextField
                          label="Percent"
                          type="number"
                          size="small"
                          value={expenseData.participantShares[member.id] ?? ""}
                          onChange={(event) =>
                            setExpenseData((current) => ({
                              ...current,
                              participantShares: {
                                ...current.participantShares,
                                [member.id]: event.target.value,
                              },
                            }))
                          }
                          slotProps={{ htmlInput: { min: 0, max: 100, step: "0.01" } }}
                        />
                      )}
                      <Typography sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, textAlign: "right", color: "var(--color-ink)" }}>
                        {formatMoney(previewShares.get(member.id) ?? 0)}
                      </Typography>
                    </Box>
                  ))}

                  {expenseData.splitType === "custom" && previewMembers.map((member) => (
                    <Box
                      key={member.id}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 160px",
                        gap: 1,
                        alignItems: "center",
                        bgcolor: member.id === expenseData.paidBy ? "var(--color-accent-soft-bg)" : "var(--color-surface-2)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-sm)",
                        px: 1.5,
                        py: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--color-ink)" }}>
                        {member.id === expenseData.paidBy ? `${getMemberLabel(member)} (paid upfront)` : getMemberLabel(member)}
                      </Typography>
                      {member.id === expenseData.paidBy ? (
                        <Typography sx={{ fontFamily: "var(--font-mono)", color: "var(--color-muted)", fontWeight: 700, textAlign: "right" }}>
                          {formatMoney(previewShares.get(member.id) ?? 0)}
                        </Typography>
                      ) : (
                        <TextField
                          label="Amount"
                          type="number"
                          size="small"
                          value={expenseData.participantShares[member.id] ?? ""}
                          onChange={(event) =>
                            setExpenseData((current) => ({
                              ...current,
                              participantShares: {
                                ...current.participantShares,
                                [member.id]: event.target.value,
                              },
                            }))
                          }
                          slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
                  Add an amount and participants to see the split breakdown.
                </Typography>
              )}
            </Box>
            <TextField
              label="Description (optional)"
              fullWidth
              multiline
              rows={3}
              placeholder="Add notes..."
              value={expenseData.description}
              onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setShowExpenseDialog(false)} sx={{ color: "var(--color-ink)" }}>
              Cancel
            </Button>
            <Button
              type="submit"
              sx={{
                bgcolor: "var(--color-accent)",
                color: "var(--color-accent-contrast)",
                "&:hover": { bgcolor: "var(--color-accent)", filter: "brightness(0.92)" },
              }}
            >
              Add Expense
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
