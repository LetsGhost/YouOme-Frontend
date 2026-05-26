import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Chip,
  Alert,
  Skeleton,
  MenuItem,
} from "@mui/material";

import { useAppState } from "../../app/AppStateContext";
import { createExpense, getGroup, listGroupMembers, type Group, type GroupMember } from "../../shared/api/backend";
import { formatMoney } from "../../shared/lib/format";
import { GroupDebtWidget } from "../../widgets/module/group/GroupDebtWidget";

type SplitType = "equal" | "custom" | "percentage";

type ExpenseDraft = {
  title: string;
  amount: string;
  paidBy: string;
  description: string;
  splitType: SplitType;
  participantIds: string[];
  participantShares: Record<string, string>;
};

function getMemberLabel(member: GroupMember) {
  return member.name || member.email || member.id;
}

function toCents(value: number) {
  return Math.round(value * 100);
}

function buildEqualShares(totalAmount: number, participantIds: string[]) {
  const totalCents = toCents(totalAmount);
  const count = participantIds.length;

  if (count === 0) {
    return new Map<string, number>();
  }

  const baseShare = Math.floor(totalCents / count);
  let remainder = totalCents - baseShare * count;
  const shares = new Map<string, number>();

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
  paidById: string
) {
  if (participantIds.length === 0) {
    return { error: "Add at least one participant." } as const;
  }

  if (splitType === "equal") {
    return { shares: buildEqualShares(totalAmount, paidById ? [paidById, ...participantIds] : participantIds) } as const;
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
  const [group, setGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [expenseData, setExpenseData] = useState<ExpenseDraft>({
    title: "",
    amount: "",
    paidBy: "",
    description: "",
    splitType: "equal",
    participantIds: [],
    participantShares: {},
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

  const members = groupMembers.length > 0 ? groupMembers : group?.members ?? [];
  const expenses = group?.expenses ?? [];
  const debtHistory = group?.debtHistory ?? [];

  const balanceValue = useMemo(() => {
    const parsed = typeof group?.balance === "number" ? group.balance : Number(String(group?.balance ?? 0).replace(/[^0-9.-]/g, ""));
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [group?.balance]);

  const youOwe = Math.max(balanceValue, 0);
  const owedToYou = Math.max(-balanceValue, 0);

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
      expenseData.paidBy
    );
  }, [expenseData.amount, expenseData.participantIds, expenseData.participantShares, expenseData.paidBy, expenseData.splitType]);

  const previewShares: Map<string, number> =
    "shares" in participantBreakdown && participantBreakdown.shares
      ? participantBreakdown.shares
      : new Map<string, number>();
  const previewMembers = payerMember ? [payerMember, ...participantMembers] : participantMembers;

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
      expenseData.paidBy || currentUser?.id || ""
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
        setShowExpenseDialog(false);
        setExpenseData({
          title: "",
          amount: "",
          paidBy: currentUser?.id || "",
          description: "",
          splitType: "equal",
          participantIds: [],
          participantShares: {},
        });
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to create expense.");
      }
    })();
  };

  const expenseSummary = expenses.length > 0 ? `${expenses.length} tracked expense${expenses.length === 1 ? "" : "s"}` : "No expenses yet";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      {/* Header with Back Button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => navigate("/groups")} sx={{ color: "text.secondary" }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            {isLoading ? (
              <Skeleton variant="text" width={260} height={42} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {group?.name || "Group"}
              </Typography>
            )}
            {isLoading ? <Skeleton variant="text" width={220} /> : <Typography variant="body2" sx={{ color: "text.secondary" }}>{group?.description || "No description provided."}</Typography>}
          </Box>
        </Box>

        <Button
          variant="outlined"
          startIcon={<SettingsIcon />}
          onClick={() => navigate(`/groups/${id}/settings`)}
          sx={{ textTransform: "none", fontWeight: 700, whiteSpace: "nowrap" }}
        >
          Settings
        </Button>
      </Box>

      {/* Quick Stats */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
        }}
      >
        <Card sx={{ borderRadius: 3, background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)" }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ color: "#991b1b", fontWeight: "bold", display: "block", mb: 0.5 }}>
              You Owe
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "#991b1b" }}>
              {formatMoney(youOwe)}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)" }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ color: "#166534", fontWeight: "bold", display: "block", mb: 0.5 }}>
              Owed to You
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "#166534" }}>
              {formatMoney(owedToYou)}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)" }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ color: "#312e81", fontWeight: "bold", display: "block", mb: 0.5 }}>
              Members
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "#312e81" }}>
              {members.length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={openExpenseDialog}
        fullWidth
        sx={{
          bgcolor: "#4f46e5",
          color: "white",
          p: 1.5,
          fontWeight: "bold",
          textTransform: "none",
          fontSize: "1rem",
          "&:hover": {
            bgcolor: "#4338ca",
          },
        }}
      >
        Add Expense
      </Button>

      {/* Members Section */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <PeopleIcon sx={{ color: "#4f46e5" }} />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Members
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {members.map((member) => (
              <Box
                key={member.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Avatar sx={{ bgcolor: "#4f46e5", color: "white", fontWeight: "bold" }}>
                  {member.avatar || member.name[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    {member.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {member.email || "No email available"}
                  </Typography>
                </Box>
                {(member.id === currentUser?.id || member.email === currentUser?.email) && (
                  <Chip label="You" size="small" sx={{ bgcolor: "#e0e7ff", color: "#4f46e5" }} />
                )}
              </Box>
            ))}
            {members.length === 0 && !isLoading && (
              <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 2 }}>
                No members found in this group.
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      <GroupDebtWidget
        backendUrl={backendUrl}
        groupId={id || ""}
        currentUserId={currentUser?.id}
        accessToken={session?.accessToken}
      />

      {/* Recent Expenses */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <TrendingUpIcon sx={{ color: "#4f46e5" }} />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Recent Expenses
            </Typography>
          </Box>

          {expenses.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {expenses.map((expense) => (
                <Box
                  key={expense.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {expense.description || "Expense"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                      {expenseSummary}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: "bold",
                      color: "#4f46e5",
                    }}
                  >
                    {formatMoney(expense.amount)}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 2 }}>
              No expenses found for this group.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Debt History */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Debt History
          </Typography>

          {debtHistory.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {debtHistory.map((entry, idx) => (
                <Box key={entry.id}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: entry.type === "settlement" ? "#f0fdf4" : "#eff6ff",
                      border: entry.type === "settlement" ? "1px solid #dcfce7" : "1px solid #e0e7ff",
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5 }}>
                        {entry.description}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                        {new Date(entry.date).toLocaleDateString()}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {entry.participants.map((participant) => (
                          <Chip
                            key={participant}
                            label={participant}
                            size="small"
                            sx={{
                              bgcolor: "transparent",
                              border: "1px solid #cbd5e1",
                              fontSize: "0.75rem",
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                        color: entry.type === "settlement" ? "#16a34a" : "#4f46e5",
                        ml: 2,
                      }}
                    >
                      {entry.amount}
                    </Typography>
                  </Box>
                  {idx < debtHistory.length - 1 && <Divider sx={{ my: 0 }} />}
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 2 }}>
              No debt history available for this group.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Add Expense Dialog */}
      <Dialog open={showExpenseDialog} onClose={() => setShowExpenseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.25rem" }}>Add Expense</DialogTitle>
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
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Who participated?
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
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
                      color={selected ? "primary" : "default"}
                      variant={selected ? "filled" : "outlined"}
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
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Split preview
              </Typography>
              {previewMembers.length > 0 && Number(expenseData.amount) > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {expenseData.splitType === "equal" &&
                    previewMembers.map((member) => (
                      <Box key={member.id} sx={{ display: "flex", justifyContent: "space-between", gap: 2, bgcolor: member.id === expenseData.paidBy ? "#eff6ff" : "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 1, px: 1.5, py: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {member.id === expenseData.paidBy ? `${getMemberLabel(member)} (paid upfront)` : getMemberLabel(member)}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatMoney(previewShares.get(member.id) ?? 0)}
                        </Typography>
                      </Box>
                    ))}

                  {expenseData.splitType === "percentage" && previewMembers.map((member) => (
                    <Box key={member.id} sx={{ display: "grid", gridTemplateColumns: "1fr 120px 120px", gap: 1, alignItems: "center", bgcolor: member.id === expenseData.paidBy ? "#eff6ff" : "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 1, px: 1.5, py: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {member.id === expenseData.paidBy ? `${getMemberLabel(member)} (paid upfront)` : getMemberLabel(member)}
                      </Typography>
                      {member.id === expenseData.paidBy ? (
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
                      <Typography variant="body2" sx={{ fontWeight: 700, textAlign: "right" }}>
                        {formatMoney(previewShares.get(member.id) ?? 0)}
                      </Typography>
                    </Box>
                  ))}

                  {expenseData.splitType === "custom" && previewMembers.map((member) => (
                    <Box key={member.id} sx={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 1, alignItems: "center", bgcolor: member.id === expenseData.paidBy ? "#eff6ff" : "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 1, px: 1.5, py: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {member.id === expenseData.paidBy ? `${getMemberLabel(member)} (paid upfront)` : getMemberLabel(member)}
                      </Typography>
                      {member.id === expenseData.paidBy ? (
                        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700, textAlign: "right" }}>
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
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
            <Button onClick={() => setShowExpenseDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: "#4f46e5" }}>
              Add Expense
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
