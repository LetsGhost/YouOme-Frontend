import { Trash2, TriangleAlert } from "lucide-react";
import { Box, Button, Card, CardContent, Divider, Typography } from "@mui/material";

export function GroupDangerZoneCard({ onDeleteClick }: { onDeleteClick: () => void }) {
  return (
    <Card sx={{ borderRadius: "var(--radius-md)", border: "1px solid var(--color-danger-border)", bgcolor: "var(--color-danger-soft-bg)" }}>
      <CardContent sx={{ display: "grid", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TriangleAlert size={18} strokeWidth={2} color="var(--color-danger)" />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "var(--color-danger)" }}>
              Danger zone
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
              Deleting this group permanently removes it, its members, and its policy for everyone.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "var(--color-danger-border)" }} />

        <Box>
          <Button
            variant="outlined"
            startIcon={<Trash2 size={16} strokeWidth={2} />}
            onClick={onDeleteClick}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              color: "var(--color-danger)",
              borderColor: "var(--color-danger-border)",
              "&:hover": { borderColor: "var(--color-danger)", bgcolor: "var(--color-danger-soft-bg)" },
            }}
          >
            Delete group
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
