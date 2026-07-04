import { CheckCircle2, Clock, Users } from "lucide-react";
import { Box, Typography } from "@mui/material";

import { formatMoney } from "../../shared/lib/format";
import { InlineSpinner } from "../../shared/ui/InlineSpinner";
import { microLabelSx, statValueSx } from "./profileStyles";

export function ProfileStatsRow({
  isLoading,
  totalSettled,
  currentlyOpen,
  friendsCount,
}: {
  isLoading: boolean;
  totalSettled: number;
  currentlyOpen: number;
  friendsCount: number;
}) {
  return (
    <Box sx={{ display: "flex", gap: 3.5, mt: 2.75 }}>
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          <CheckCircle2 size={12} strokeWidth={2.4} color="var(--color-success)" />
          <Typography sx={microLabelSx}>Total settled</Typography>
        </Box>
        <Typography sx={statValueSx}>{isLoading ? <InlineSpinner size={16} /> : formatMoney(totalSettled)}</Typography>
      </Box>

      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          <Clock size={12} strokeWidth={2.2} color="var(--color-warning)" />
          <Typography sx={microLabelSx}>Currently open</Typography>
        </Box>
        <Typography sx={statValueSx}>{isLoading ? <InlineSpinner size={16} /> : formatMoney(currentlyOpen)}</Typography>
      </Box>

      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          <Users size={12} strokeWidth={2.2} color="var(--color-accent)" />
          <Typography sx={microLabelSx}>Friends</Typography>
        </Box>
        <Typography sx={statValueSx}>{isLoading ? <InlineSpinner size={16} /> : friendsCount}</Typography>
      </Box>
    </Box>
  );
}
