import SettingsIcon from "@mui/icons-material/Settings";
import { Box, Typography } from "@mui/material";

export function SettingsHeader() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          width: 56,
          height: 56,
          borderRadius: "var(--radius-md)",
          bgcolor: "var(--color-accent-soft-bg)",
          flexShrink: 0,
        }}
      >
        <SettingsIcon sx={{ fontSize: 28, color: "var(--color-accent-soft-ink)" }} />
      </Box>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "var(--color-ink)" }}>
          Settings
        </Typography>
        <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
          Configure your account and application preferences
        </Typography>
      </Box>
    </Box>
  );
}
