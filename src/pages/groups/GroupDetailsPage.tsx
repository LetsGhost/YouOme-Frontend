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
} from "@mui/material";

import { useAppState } from "../../app/AppStateContext";
import { createExpense, getGroup, listGroupMembers, type Group, type GroupMember } from "../../shared/api/backend";
import { formatMoney } from "../../shared/lib/format";

export function GroupDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { backendUrl, currentUser, session } = useAppState();
  const [group, setGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [expenseData, setExpenseData] = useState({
    title: "",
    amount: "",
    paidBy: "",
    description: "",
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

    void (async () => {
      setErrorMessage(null);

      try {
        await createExpense(
          backendUrl,
          {
            groupId: id,
            title: expenseData.title.trim(),
            amount,
            paidBy: expenseData.paidBy || currentUser?.id,
            description: expenseData.description.trim() || undefined,
          },
          session?.accessToken
        );

        const refreshed = await getGroup(backendUrl, id, session?.accessToken);
        setGroup(refreshed);
        setShowExpenseDialog(false);
        setExpenseData({ title: "", amount: "", paidBy: currentUser?.id || "", description: "" });
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
        onClick={() => setShowExpenseDialog(true)}
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
              onChange={(e) => setExpenseData({ ...expenseData, paidBy: e.target.value })}
              variant="outlined"
            >
              <option value={currentUser?.id || "you"}>You</option>
              {members
                .filter((member) => member.id !== currentUser?.id)
                .map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
            </TextField>
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
