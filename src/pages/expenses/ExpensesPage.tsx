import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ReceiptIcon from "@mui/icons-material/Receipt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useMemo, useState, type FormEvent } from "react";
import {
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputAdornment,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel,
  FormHelperText,
} from "@mui/material";

import { useAppState } from "../../app/AppStateContext";
import { createExpense } from "../../shared/api/backend";
import { formatMoney } from "../../shared/lib/format";

export function ExpensesPage() {
  const { backendUrl, groups, reloadGroups, session, isBootstrapping } = useAppState();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState({
    groupId: "",
    title: "",
    amount: "",
    paidBy: "",
    description: "",
  });

  const expenses = useMemo(
    () =>
      groups.flatMap((group) =>
        (group.expenses ?? []).map((expense) => ({
          ...expense,
          groupId: group.id,
          groupName: group.name,
          paidByName: typeof expense.paidBy === "object" && expense.paidBy ? expense.paidBy.name || "Someone" : String(expense.paidBy || "Someone"),
        }))
      ),
    [groups]
  );

  const filteredExpenses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return expenses.filter((expense) => {
      const matchesSearch = !term || `${expense.description || ""} ${expense.groupName}`.toLowerCase().includes(term);

      if (!matchesSearch) {
        return false;
      }

      const normalizedStatus = (expense.status || "pending").toLowerCase();

      if (filter === "paid") {
        return normalizedStatus === "settled" || normalizedStatus === "paid" || normalizedStatus === "completed";
      }

      if (filter === "pending") {
        return normalizedStatus !== "settled" && normalizedStatus !== "paid" && normalizedStatus !== "completed";
      }

      return true;
    });
  }, [expenses, filter, searchTerm]);

  const handleCreateExpense = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newExpense.groupId) {
      setErrorMessage("Pick a group first.");
      return;
    }

    if (!newExpense.title.trim()) {
      setErrorMessage("Expense title is required.");
      return;
    }

    const amount = Number(newExpense.amount);

    if (Number.isNaN(amount) || amount <= 0) {
      setErrorMessage("Enter a valid amount.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await createExpense(
        backendUrl,
        {
          groupId: newExpense.groupId,
          title: newExpense.title.trim(),
          amount,
          paidBy: newExpense.paidBy.trim() || session?.user.id,
          description: newExpense.description.trim() || undefined,
        },
        session?.accessToken
      );

      await reloadGroups();
      setShowCreateDialog(false);
      setNewExpense({ groupId: groups[0]?.id || "", title: "", amount: "", paidBy: session?.user.id || "", description: "" });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to create expense.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { sm: "center" },
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <ReceiptIcon sx={{ fontSize: 40, color: "#4f46e5" }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              Expenses
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Add and track shared expenses
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setErrorMessage(null);
            setNewExpense((current) => ({
              ...current,
              groupId: current.groupId || groups[0]?.id || "",
              paidBy: current.paidBy || session?.user.id || "",
            }));
            setShowCreateDialog(true);
          }}
          sx={{
            bgcolor: "#4f46e5",
            color: "white",
            p: 1.5,
            fontWeight: "bold",
            "&:hover": {
              bgcolor: "#4338ca",
            },
          }}
        >
          New Expense
        </Button>

        {errorMessage && (
          <Box sx={{ color: "error.main", fontSize: "0.875rem", fontWeight: 600 }}>
            {errorMessage}
          </Box>
        )}
      </Box>

      {/* Search & Filter */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <TextField
          fullWidth
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 1,
            },
          }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            startAdornment={
              <InputAdornment position="start">
                <FilterListIcon sx={{ mr: 1 }} />
              </InputAdornment>
            }
          >
            <MenuItem value="all">All expenses</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Expenses List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {filteredExpenses.map((expense) => (
          <Card key={expense.id} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center", flex: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: "#eef2ff",
                      color: "#4f46e5",
                    }}
                  >
                    <TrendingUpIcon />
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      {expense.description || "Expense"}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                      <Chip
                        label={expense.groupName}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "0.75rem" }}
                      />
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Paid by {expense.paidByName}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {formatMoney(expense.amount)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: "bold",
                      color:
                        (expense.status || "pending") === "settled" ||
                        (expense.status || "pending") === "paid" ||
                        (expense.status || "pending") === "completed"
                          ? "#22c55e"
                          : "#f59e0b",
                    }}
                  >
                    {(expense.status || "pending") === "settled" ||
                    (expense.status || "pending") === "paid" ||
                    (expense.status || "pending") === "completed"
                      ? "✓ Settled"
                      : "⏳ Pending"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}

        {!isBootstrapping && filteredExpenses.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <ReceiptIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              No expenses found
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 2 }}>
              Create an expense in one of your groups to populate this feed.
            </Typography>
          </Box>
        )}
      </Box>

      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>New Expense</DialogTitle>
        <form onSubmit={handleCreateExpense}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              select
              label="Group"
              value={newExpense.groupId}
              onChange={(event) => setNewExpense((current) => ({ ...current, groupId: event.target.value }))}
              required
              fullWidth
            >
              {groups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Title"
              value={newExpense.title}
              onChange={(event) => setNewExpense((current) => ({ ...current, title: event.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Amount"
              type="number"
              value={newExpense.amount}
              onChange={(event) => setNewExpense((current) => ({ ...current, amount: event.target.value }))}
              required
              fullWidth
              inputProps={{ min: 0, step: "0.01" }}
            />
            <TextField
              label="Paid by"
              value={newExpense.paidBy}
              onChange={(event) => setNewExpense((current) => ({ ...current, paidBy: event.target.value }))}
              fullWidth
              helperText="Use a member id or leave empty to default to your current user id."
            />
            <TextField
              label="Description"
              value={newExpense.description}
              onChange={(event) => setNewExpense((current) => ({ ...current, description: event.target.value }))}
              fullWidth
              multiline
              rows={3}
            />
            <FormHelperText sx={{ m: 0 }}>
              This uses the real <code>/api/expenses</code> create endpoint.
            </FormHelperText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ bgcolor: "#4f46e5" }}>
              {isSubmitting ? "Creating..." : "Create Expense"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}