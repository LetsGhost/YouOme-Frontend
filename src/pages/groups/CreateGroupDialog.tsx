import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, TextField } from "@mui/material";

export type NewGroupForm = {
  name: string;
  description: string;
};

type PreventableEvent = { preventDefault: () => void };

export function CreateGroupDialog({
  open,
  onClose,
  newGroup,
  onChange,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onClose: () => void;
  newGroup: NewGroupForm;
  onChange: (patch: Partial<NewGroupForm>) => void;
  onSubmit: (event: PreventableEvent) => void;
  isSubmitting: boolean;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.5rem", color: "var(--color-ink)" }}>
        Create New Group
      </DialogTitle>
      <Divider sx={{ borderColor: "var(--color-border)" }} />
      <DialogContent sx={{ pt: 2 }}>
        <Box component="form" onSubmit={onSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            label="Group name"
            value={newGroup.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Weekend Trip"
            required
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Description (optional)"
            value={newGroup.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="What is this group about?"
            multiline
            rows={3}
            variant="outlined"
          />
        </Box>
      </DialogContent>
      <Divider sx={{ borderColor: "var(--color-border)" }} />
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ textTransform: "none", fontWeight: 700, borderColor: "var(--color-border)", color: "var(--color-ink)" }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          sx={{
            bgcolor: "var(--color-accent)",
            color: "var(--color-accent-contrast)",
            textTransform: "none",
            fontWeight: 700,
            "&:hover": {
              bgcolor: "var(--color-accent)",
              filter: "brightness(0.92)",
            },
          }}
        >
          {isSubmitting ? "Creating..." : "Create Group"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
