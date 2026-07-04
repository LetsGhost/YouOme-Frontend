import { TrendingDown, TrendingUp } from "lucide-react";
import { Box, Typography } from "@mui/material";

import { formatMoney } from "../../shared/lib/format";
import { microLabelSx } from "./groupDetailsHelpers";

export function GroupQuickStats({ youOwe, owedToYou }: { youOwe: number; owedToYou: number }) {
  return (
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
  );
}
