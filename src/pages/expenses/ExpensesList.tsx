import { Receipt } from "lucide-react";
import { Box, Typography } from "@mui/material";

import { ExpenseCard, type ExpenseListItem } from "./ExpenseCard";

export function ExpensesList({
  expenses,
  showEmptyState,
}: {
  expenses: ExpenseListItem[];
  showEmptyState: boolean;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {expenses.map((expense) => (
        <ExpenseCard key={expense.id} expense={expense} />
      ))}

      {showEmptyState && expenses.length === 0 && (
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
  );
}
