import { CalendarClock, ChevronRight } from "lucide-react";
import { Box, Typography } from "@mui/material";

import type { SettlementRun } from "../../shared/api/backend";
import { formatShortDate } from "../../shared/lib/format";

export function ScheduledSettlementBanner({
  run,
  pendingCount,
  onClick,
}: {
  run: SettlementRun;
  pendingCount: number;
  onClick: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        bgcolor: "var(--color-surface-2)",
        p: 2,
        cursor: "pointer",
        "&:hover": { borderColor: "var(--color-border-strong)" },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "var(--radius-sm)",
          bgcolor: "var(--color-accent-soft-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <CalendarClock size={18} strokeWidth={2} color="var(--color-accent-soft-ink)" />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--color-ink)" }}>
          Scheduled settlement in progress
        </Typography>
        <Typography variant="caption" sx={{ color: "var(--color-muted)", display: "block", mt: "2px" }}>
          Closes {formatShortDate(run.graceDeadlineAt)}
          {pendingCount > 0
            ? ` · ${pendingCount} confirmation${pendingCount === 1 ? "" : "s"} pending`
            : ""}
        </Typography>
      </Box>

      <ChevronRight size={18} strokeWidth={2} color="var(--color-muted)" style={{ flexShrink: 0 }} />
    </Box>
  );
}
