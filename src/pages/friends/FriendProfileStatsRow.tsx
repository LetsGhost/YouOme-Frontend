import { ChevronRight, TrendingUp, Users } from "lucide-react";
import { Box, Typography } from "@mui/material";

import { formatMoney } from "../../shared/lib/format";
import { InlineSpinner } from "../../shared/ui/InlineSpinner";
import { microLabelSx } from "./friendsStyles";

const statValueSx = {
  fontFamily: "var(--font-mono)",
  fontWeight: 700,
  fontSize: "1.1rem",
  color: "var(--color-ink)",
  mt: 0.5,
} as const;

export function FriendProfileStatsRow({
  isLoading,
  owesYou,
  sharedGroupsCount,
  onOpenSharedGroups,
}: {
  isLoading: boolean;
  owesYou: number;
  sharedGroupsCount: number;
  onOpenSharedGroups: () => void;
}) {
  return (
    <Box sx={{ display: "flex", gap: 3.5, mt: 2.75 }}>
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          <TrendingUp size={12} strokeWidth={2.6} color="var(--color-success)" />
          <Typography sx={microLabelSx}>Owes you</Typography>
        </Box>
        <Typography sx={statValueSx}>{isLoading ? <InlineSpinner size={16} /> : formatMoney(owesYou)}</Typography>
      </Box>

      <Box
        component="button"
        type="button"
        onClick={onOpenSharedGroups}
        disabled={sharedGroupsCount === 0}
        sx={{
          all: "unset",
          cursor: sharedGroupsCount > 0 ? "pointer" : "default",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          <Users size={12} strokeWidth={2.2} color="var(--color-accent)" />
          <Typography sx={microLabelSx}>Shared groups</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, mt: 0.5 }}>
          {isLoading ? (
            <InlineSpinner size={16} />
          ) : (
            <>
              <Typography sx={statValueSx}>{sharedGroupsCount}</Typography>
              {sharedGroupsCount > 0 && <ChevronRight size={13} strokeWidth={2.4} color="var(--color-muted)" />}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
