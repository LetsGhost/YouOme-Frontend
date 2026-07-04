import { TrendingUp } from "lucide-react";
import { Box, Card, CardContent, Chip, Typography } from "@mui/material";

import type { GroupExpense } from "../../shared/api/backend";
import { formatMoney } from "../../shared/lib/format";
import { isSettledStatus } from "./expenseUtils";
import { microLabelSx } from "./expensesStyles";

export type ExpenseListItem = GroupExpense & {
  groupId: string;
  groupName: string;
  paidByName: string;
};

export function ExpenseCard({ expense }: { expense: ExpenseListItem }) {
  const settled = isSettledStatus(expense.status);

  return (
    <Card sx={{ bgcolor: "var(--color-surface-2)", boxShadow: "none" }}>
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
}
