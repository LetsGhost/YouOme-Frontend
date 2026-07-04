import { ChevronDown, ChevronUp, Wallet } from "lucide-react";
import { Box, Card, CardContent, Chip, Collapse, IconButton, Pagination, Skeleton, Typography } from "@mui/material";

import type { GroupExpense, PaginatedGroupExpenses } from "../../shared/api/backend";
import { formatMoney, formatTimestamp } from "../../shared/lib/format";

export function RecentExpensesCard({
  expensesExpanded,
  onToggleExpanded,
  totalExpensesCount,
  isExpensesLoading,
  expenses,
  expensesData,
  expensesPageNum,
  onPageChange,
  isPhoneScreen,
}: {
  expensesExpanded: boolean;
  onToggleExpanded: () => void;
  totalExpensesCount: number;
  isExpensesLoading: boolean;
  expenses: GroupExpense[];
  expensesData: PaginatedGroupExpenses | null;
  expensesPageNum: number;
  onPageChange: (page: number) => void;
  isPhoneScreen: boolean;
}) {
  return (
    <Card sx={{ borderRadius: "var(--radius-md)" }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          onClick={onToggleExpanded}
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
                      onChange={(_event, value) => onPageChange(value)}
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
  );
}
