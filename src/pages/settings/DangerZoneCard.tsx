import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import WarningIcon from "@mui/icons-material/Warning";
import { Box, Button, Paper, Typography } from "@mui/material";

export function DangerZoneCard({ isDeleting, onDeleteAccount }: { isDeleting: boolean; onDeleteAccount: () => void }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "var(--radius-md)",
        bgcolor: "var(--color-danger-soft-bg)",
        border: "1px solid var(--color-danger-border)",
        p: 3,
      }}
    >
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <WarningIcon sx={{ color: "var(--color-danger)", fontSize: 28, flexShrink: 0, mt: 0.5 }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "var(--color-danger)", mb: 0.5 }}>
            Danger Zone
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--color-danger)" }}>
            These actions cannot be undone
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Button
          variant="outlined"
          startIcon={<DeleteForeverIcon />}
          onClick={onDeleteAccount}
          disabled={isDeleting}
          sx={{
            borderColor: "var(--color-danger)",
            color: "var(--color-danger)",
            textTransform: "none",
            fontWeight: "bold",
            alignSelf: "flex-start",
            "&:hover": {
              borderColor: "var(--color-danger)",
              bgcolor: "var(--color-danger-soft-bg)",
            },
          }}
        >
          {isDeleting ? "Deleting..." : "Delete account"}
        </Button>
      </Box>
    </Paper>
  );
}
