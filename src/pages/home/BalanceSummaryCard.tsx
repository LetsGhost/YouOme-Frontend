import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Box, Typography } from "@mui/material";

import { formatMoney } from "../../shared/lib/format";
import { microLabelSx } from "./homeStyles";

export function BalanceSummaryCard({ youOwe, owedToYou }: { youOwe: number; owedToYou: number }) {
  const balanceTotal = youOwe + owedToYou;
  const youOwePct = balanceTotal > 0 ? (youOwe / balanceTotal) * 100 : 0;
  const owedPct = balanceTotal > 0 ? 100 - youOwePct : 0;
  const net = owedToYou - youOwe;
  const netSign = net >= 0 ? "+" : "-";

  return (
    <Box
      sx={{
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border)",
        bgcolor: "var(--color-surface-2)",
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <Box sx={{ pr: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
            <ArrowUpRight size={16} strokeWidth={2.2} color="var(--color-warning)" />
            <Typography sx={{ ...microLabelSx, color: "var(--color-warning)" }}>You owe</Typography>
          </Box>
          <Typography
            sx={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: { xs: "1.3rem", md: "1.5rem" },
              color: "var(--color-ink)",
            }}
          >
            {formatMoney(youOwe)}
          </Typography>
        </Box>
        <Box sx={{ pl: 2, borderLeft: "1px solid var(--color-border)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
            <ArrowDownLeft size={16} strokeWidth={2.2} color="var(--color-success)" />
            <Typography sx={{ ...microLabelSx, color: "var(--color-success)" }}>Owed to you</Typography>
          </Box>
          <Typography
            sx={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: { xs: "1.3rem", md: "1.5rem" },
              color: "var(--color-ink)",
            }}
          >
            {formatMoney(owedToYou)}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          height: 6,
          borderRadius: "var(--radius-pill)",
          overflow: "hidden",
          bgcolor: "var(--color-surface-3)",
          mt: 2.25,
        }}
      >
        {balanceTotal > 0 ? (
          <>
            <Box sx={{ width: `${youOwePct}%`, bgcolor: "var(--color-warning)" }} />
            <Box sx={{ width: `${owedPct}%`, bgcolor: "var(--color-success)" }} />
          </>
        ) : null}
      </Box>

      <Typography sx={{ ...microLabelSx, mt: 1.25 }}>
        Net {netSign}
        {formatMoney(Math.abs(net))}
      </Typography>
    </Box>
  );
}
