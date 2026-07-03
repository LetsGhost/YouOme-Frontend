import { Plus, Search, Receipt, TrendingUp, Filter } from "lucide-react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
} from "@mui/material";

import { useAppState } from "../../app/AppStateContext";
import { createExpense } from "../../shared/api/backend";
import { formatMoney } from "../../shared/lib/format";

const microLabelSx = {
  fontFamily: "var(--font-mono)",
  fontSize: 10.5,
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  color: "var(--color-muted)",
};

const outlinedFieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "var(--color-surface)",
    "& fieldset": { borderColor: "var(--color-border)" },
    "&:hover fieldset": { borderColor: "var(--color-border-strong)" },
    "&.Mui-focused fieldset": { borderColor: "var(--color-accent)" },
  },
};

function isSettledStatus(status: string | undefined) {
  const normalized = (status || "pending").toLowerCase();
  return normalized === "settled" || normalized === "paid" || normalized === "completed";
}

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
          createdByUserId: session?.user.id || "",
          title: newExpense.title.trim(),
          totalAmount: amount,
          paidByUserId: newExpense.paidBy.trim() || session?.user.id,
          splitType: "equal",
          note: newExpense.description.trim() || undefined,
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
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-sm)",
              bgcolor: "var(--color-accent-soft-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Receipt size={20} color="var(--color-accent-soft-ink)" strokeWidth={2} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "var(--color-ink)" }}>
              Expenses
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
              Add and track shared expenses
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} strokeWidth={2} />}
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
            bgcolor: "var(--color-accent)",
            color: "var(--color-accent-contrast)",
            px: 3,
            fontWeight: 700,
            "&:hover": {
              bgcolor: "var(--color-accent)",
              opacity: 0.9,
            },
          }}
        >
          New Expense
        </Button>
      </Box>

      {errorMessage && (
        <Box
          sx={{
            px: 2,
            py: 1.25,
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-danger-border)",
            bgcolor: "var(--color-danger-soft-bg)",
            color: "var(--color-danger)",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          {errorMessage}
        </Box>
      )}

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
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color="var(--color-muted)" strokeWidth={1.8} />
                </InputAdornment>
              ),
            },
          }}
          sx={outlinedFieldSx}
        />
        <FormControl sx={{ minWidth: 170 }}>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            startAdornment={
              <InputAdornment position="start">
                <Filter size={16} color="var(--color-muted)" strokeWidth={1.8} style={{ marginRight: 8 }} />
              </InputAdornment>
            }
            sx={{
              bgcolor: "var(--color-surface)",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-border)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-border-strong)" },
            }}
          >
            <MenuItem value="all">All expenses</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Expenses List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {filteredExpenses.map((expense) => {
          const settled = isSettledStatus(expense.status);

          return (
            <Card key={expense.id} sx={{ bgcolor: "var(--color-surface-2)", boxShadow: "none" }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center", flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "var(--radius-sm)",
                        bgcolor: "var(--color-accent-soft-bg)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <TrendingUp size={20} color="var(--color-accent-soft-ink)" strokeWidth={2} />
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--color-ink)" }} noWrap>
                        {expense.description || "Expense"}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap", alignItems: "center" }}>
                        <Chip
                          label={expense.groupName}
                          size="small"
                          sx={{
                            fontSize: "0.7rem",
                            height: 22,
                            bgcolor: "var(--color-surface-3)",
                            color: "var(--color-muted)",
                            border: "1px solid var(--color-border)",
                          }}
                        />
                        <Typography sx={microLabelSx}>Paid by {expense.paidByName}</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                    <Typography
                      sx={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        fontSize: "1.05rem",
                        color: "var(--color-ink)",
                      }}
                    >
                      {formatMoney(expense.amount)}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, justifyContent: "flex-end", mt: 0.5 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: settled ? "var(--color-success)" : "var(--color-warning)",
                        }}
                      />
                      <Typography
                        sx={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10.5,
                          fontWeight: 600,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          color: settled ? "var(--color-success)" : "var(--color-warning)",
                        }}
                      >
                        {settled ? "Settled" : "Pending"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}

        {!isBootstrapping && filteredExpenses.length === 0 && (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Receipt size={56} strokeWidth={1.6} color="var(--color-muted-3)" style={{ marginBottom: 12 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "var(--color-ink)" }}>
              No expenses found
            </Typography>
            <Typography sx={{ color: "var(--color-muted)", mb: 2 }}>
              Create an expense in one of your groups to populate this feed.
            </Typography>
          </Box>
        )}
      </Box>

      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "var(--color-ink)" }}>New Expense</DialogTitle>
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
              slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
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
            <FormHelperText sx={{ m: 0, color: "var(--color-muted)" }}>
              This uses the real <code>/api/expenses</code> create endpoint.
            </FormHelperText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setShowCreateDialog(false)} sx={{ color: "var(--color-muted)" }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                bgcolor: "var(--color-accent)",
                color: "var(--color-accent-contrast)",
                "&:hover": { bgcolor: "var(--color-accent)", opacity: 0.9 },
              }}
            >
              {isSubmitting ? "Creating..." : "Create Expense"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
