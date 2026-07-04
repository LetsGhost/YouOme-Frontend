import { Users } from "lucide-react";
import { Box, Typography } from "@mui/material";

export function FriendsHeader() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        pb: 3,
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
          <Users size={20} color="var(--color-accent-soft-ink)" strokeWidth={2} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.4, color: "var(--color-ink)" }}>
          Friends
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
        Invite people by email, review requests, and keep your friend list in sync.
      </Typography>
    </Box>
  );
}
