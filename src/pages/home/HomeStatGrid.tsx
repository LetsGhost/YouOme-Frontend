import { Clock, Users } from "lucide-react";
import { Box, Typography } from "@mui/material";

import { formatCount } from "../../shared/lib/format";
import { InlineSpinner } from "../../shared/ui/InlineSpinner";
import { microLabelSx } from "./homeStyles";

export function HomeStatGrid({
  isLoading = false,
  pendingPayments,
  groupsCount,
}: {
  isLoading?: boolean;
  pendingPayments: number;
  groupsCount: number;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 1.5,
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      }}
    >
      <Box
        sx={{
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--color-border)",
          p: { xs: 1.5, md: 2 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
          <Clock size={16} strokeWidth={2} color="var(--color-warning)" />
          <Typography sx={microLabelSx}>Pending</Typography>
        </Box>
        <Typography sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.15rem", color: "var(--color-ink)" }}>
          {isLoading ? <InlineSpinner size={16} color="var(--color-warning)" /> : formatCount(pendingPayments)}
        </Typography>
      </Box>
      <Box
        sx={{
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--color-border)",
          p: { xs: 1.5, md: 2 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
          <Users size={16} strokeWidth={2} color="var(--color-accent)" />
          <Typography sx={microLabelSx}>Groups</Typography>
        </Box>
        <Typography sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.15rem", color: "var(--color-ink)" }}>
          {isLoading ? <InlineSpinner size={16} color="var(--color-accent)" /> : formatCount(groupsCount)}
        </Typography>
      </Box>
    </Box>
  );
}
