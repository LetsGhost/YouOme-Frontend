import { Bell, CheckCircle2, Trash2 } from "lucide-react";
import { Alert, Box, Button, Typography } from "@mui/material";

import { microLabelSx } from "./notificationsStyles";

export type SectionSummaryItem = { label: string; value: number; tone: "neutral" | "warning" };

export function NotificationsSummary({
  errorMessage,
  sectionSummary,
  hasAccessToken,
  unreadCount,
  totalCount,
  isBulkActionPending,
  onMarkAllAsRead,
  onClearAll,
}: {
  errorMessage: string | null;
  sectionSummary: SectionSummaryItem[];
  hasAccessToken: boolean;
  unreadCount: number;
  totalCount: number;
  isBulkActionPending: boolean;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}) {
  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 3.5 },
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      {errorMessage && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: "var(--radius-sm)",
            display: "grid",
            placeItems: "center",
            bgcolor: "var(--color-accent-soft-bg)",
            color: "var(--color-accent-soft-ink)",
          }}
        >
          <Bell size={22} strokeWidth={2} />
        </Box>
        <Box>
          <Typography sx={{ ...microLabelSx, mb: 0.25 }}>Activity stream</Typography>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: "1.3rem", md: "1.5rem" }, color: "var(--color-ink)" }}>
            Notifications
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          mb: 2.5,
        }}
      >
        {sectionSummary.map((item) => {
          const isWarning = item.tone === "warning";
          return (
            <Box
              key={item.label}
              sx={{
                borderRadius: "var(--radius-sm)",
                border: `1px solid ${isWarning ? "var(--color-warning-border)" : "var(--color-border)"}`,
                bgcolor: isWarning ? "var(--color-warning-soft-bg)" : "transparent",
                p: { xs: 1.5, md: 2 },
              }}
            >
              <Typography sx={{ ...microLabelSx, color: isWarning ? "var(--color-warning)" : "var(--color-muted)", mb: 0.5 }}>
                {item.label}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  fontSize: { xs: "1.1rem", md: "1.3rem" },
                  color: isWarning ? "var(--color-warning)" : "var(--color-ink)",
                }}
              >
                {item.value}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, flexDirection: { xs: "column", sm: "row" } }}>
        <Button
          variant="contained"
          onClick={onMarkAllAsRead}
          disabled={!hasAccessToken || unreadCount === 0 || isBulkActionPending}
          startIcon={isBulkActionPending && unreadCount > 0 ? undefined : <CheckCircle2 size={16} strokeWidth={2.2} />}
          sx={{
            bgcolor: "var(--color-accent)",
            color: "var(--color-accent-contrast)",
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "var(--radius-sm)",
            px: 2,
            boxShadow: "none",
            "&:hover": { bgcolor: "var(--color-accent)", boxShadow: "none", opacity: 0.9 },
            "&.Mui-disabled": { opacity: 0.5, color: "var(--color-accent-contrast)" },
          }}
        >
          {isBulkActionPending && unreadCount > 0 ? "Marking..." : "Mark all seen"}
        </Button>
        <Button
          variant="outlined"
          onClick={onClearAll}
          disabled={!hasAccessToken || totalCount === 0 || isBulkActionPending}
          startIcon={<Trash2 size={16} strokeWidth={2.2} />}
          sx={{
            borderColor: "var(--color-danger-border)",
            color: "var(--color-danger)",
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "var(--radius-sm)",
            px: 2,
            "&:hover": {
              borderColor: "var(--color-danger)",
              backgroundColor: "var(--color-danger-soft-bg)",
            },
            "&.Mui-disabled": { opacity: 0.5 },
          }}
        >
          Clear all
        </Button>
      </Box>
    </Box>
  );
}
