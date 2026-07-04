import { Plus } from "lucide-react";
import { Box, Button, Typography } from "@mui/material";

export function GroupsHeader({ onNewGroup }: { onNewGroup: () => void }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { sm: "center" },
        gap: 2,
        pb: 2,
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "var(--color-ink)", mb: 0.5 }}>
          Groups
        </Typography>
        <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
          Manage and view all your shared groups
        </Typography>
      </Box>
      <Button
        startIcon={<Plus size={18} strokeWidth={2} />}
        onClick={onNewGroup}
        sx={{
          bgcolor: "var(--color-accent)",
          color: "var(--color-accent-contrast)",
          borderRadius: "var(--radius-pill)",
          px: 2.5,
          fontWeight: 700,
          "&:hover": {
            bgcolor: "var(--color-accent)",
            filter: "brightness(0.92)",
          },
        }}
      >
        New Group
      </Button>
    </Box>
  );
}
