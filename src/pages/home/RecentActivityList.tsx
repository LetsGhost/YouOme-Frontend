import { Bell, ChevronRight, Receipt, Users } from "lucide-react";
import { Box, Typography, Link as MuiLink } from "@mui/material";
import { Link } from "react-router-dom";

import { LoadingBlock } from "../../shared/ui/InlineSpinner";
import { microLabelSx } from "./homeStyles";

export type RecentActivity = {
  user: string;
  action: string;
  group: string;
  time: string;
  kind: "expense" | "group";
};

export function RecentActivityList({
  isLoading = false,
  activities,
}: {
  isLoading?: boolean;
  activities: RecentActivity[];
}) {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Bell size={18} strokeWidth={2} color="var(--color-ink)" />
        <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--color-ink)" }}>Notifications</Typography>
      </Box>

      {isLoading ? <LoadingBlock /> : null}

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {!isLoading && activities.map((activity, idx) => {
          const Icon = activity.kind === "expense" ? Receipt : Users;
          return (
            <Box
              key={idx}
              sx={{
                display: "flex",
                gap: 1.5,
                alignItems: "flex-start",
                py: 1.5,
                borderTop: idx === 0 ? "none" : "1px solid var(--color-border)",
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  borderRadius: "var(--radius-sm)",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "var(--color-accent-soft-bg)",
                  color: "var(--color-accent-soft-ink)",
                }}
              >
                <Icon size={16} strokeWidth={2} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ color: "var(--color-ink-soft)" }}>
                  <Box component="strong" sx={{ color: "var(--color-ink)" }}>
                    {activity.user}
                  </Box>{" "}
                  {activity.action} {activity.group}
                </Typography>
                <Typography sx={{ ...microLabelSx, mt: 0.5 }}>{activity.time}</Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      <MuiLink
        component={Link}
        to="/notifications"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          mt: 2,
          color: "var(--color-accent-strong-ink)",
          fontWeight: 700,
          fontSize: "0.875rem",
          textDecoration: "none",
          "&:hover": {
            textDecoration: "underline",
          },
        }}
      >
        View all notifications
        <ChevronRight size={16} strokeWidth={2.2} />
      </MuiLink>
    </Box>
  );
}
