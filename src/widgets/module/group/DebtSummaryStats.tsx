import { Box, Skeleton, Typography } from "@mui/material";

import { microLabelSx, monoStatSx } from "./groupDebtWidgetHelpers";

export function DebtSummaryStats({
  isLoading,
  expenseCount,
  pendingMyPayment,
  awaitingReview,
}: {
  isLoading: boolean;
  expenseCount: number;
  pendingMyPayment: number;
  awaitingReview: number;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 1.5,
        gridTemplateColumns: "repeat(3, 1fr)",
        mb: 2,
        pt: 2,
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <Box>
        <Typography sx={microLabelSx}>Open</Typography>
        <Typography sx={monoStatSx}>{isLoading ? <Skeleton width={48} /> : expenseCount}</Typography>
      </Box>
      <Box>
        <Typography sx={microLabelSx}>Waiting</Typography>
        <Typography sx={monoStatSx}>{isLoading ? <Skeleton width={48} /> : pendingMyPayment}</Typography>
      </Box>
      <Box>
        <Typography sx={microLabelSx}>Review</Typography>
        <Typography sx={monoStatSx}>{isLoading ? <Skeleton width={48} /> : awaitingReview}</Typography>
      </Box>
    </Box>
  );
}
