import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";

const BIO_MAX_LENGTH = 240;

export function EditBioDialog({
  open,
  onClose,
  bio,
  onBioChange,
  isSaving,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  bio: string;
  onBioChange: (value: string) => void;
  isSaving: boolean;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Edit bio</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
          <TextField
            label="Bio"
            placeholder="Splitting the rent, not the friendship."
            value={bio}
            onChange={(event) => onBioChange(event.target.value.slice(0, BIO_MAX_LENGTH))}
            fullWidth
            multiline
            minRows={3}
            autoFocus
          />
          <Typography variant="caption" sx={{ color: "var(--color-muted)", textAlign: "right" }}>
            {bio.length}/{BIO_MAX_LENGTH}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isSaving} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={isSaving} sx={{ textTransform: "none", fontWeight: "bold" }}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
