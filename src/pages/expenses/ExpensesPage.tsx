import { useMemo, useState, type FormEvent } from "react";
import { Box } from "@mui/material";

import { useAppState } from "../../app/AppStateContext";
import { createExpense } from "../../shared/api/backend";
import { CreateExpenseDialog, type NewExpenseForm } from "./CreateExpenseDialog";
import { type ExpenseListItem } from "./ExpenseCard";
import { ExpensesHeader } from "./ExpensesHeader";
import { ExpensesList } from "./ExpensesList";
import { ExpensesSearchFilter, type ExpenseFilter } from "./ExpensesSearchFilter";

export function ExpensesPage() {
  const { backendUrl, groups, reloadGroups, session, isBootstrapping } = useAppState();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<ExpenseFilter>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState<NewExpenseForm>({
    groupId: "",
    title: "",
    amount: "",
    paidBy: "",
    description: "",
  });

  const expenses = useMemo<ExpenseListItem[]>(
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
      <ExpensesHeader
        onNewExpense={() => {
          setErrorMessage(null);
          setNewExpense((current) => ({
            ...current,
            groupId: current.groupId || groups[0]?.id || "",
            paidBy: current.paidBy || session?.user.id || "",
          }));
          setShowCreateDialog(true);
        }}
      />

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

      <ExpensesSearchFilter
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        filter={filter}
        onFilterChange={setFilter}
      />

      <ExpensesList expenses={filteredExpenses} showEmptyState={!isBootstrapping} />

      <CreateExpenseDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        groups={groups}
        newExpense={newExpense}
        onChange={(patch) => setNewExpense((current) => ({ ...current, ...patch }))}
        onSubmit={handleCreateExpense}
        isSubmitting={isSubmitting}
      />
    </Box>
  );
}
