import { Plus, Receipt } from "lucide-react";
import { Box, Button, Typography } from "@mui/material";

export function ExpensesHeader({ onNewExpense }: { onNewExpense: () => void }) {
  return (
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
        onClick={onNewExpense}
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
  );
}
