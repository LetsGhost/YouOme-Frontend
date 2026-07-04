import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";

export type EditExpenseForm = { title: string; totalAmount: string; note: string };

export function EditExpenseDialog({
  open,
  form,
  onFormChange,
  isSaving,
  error,
  onClose,
  onSave,
}: {
  open: boolean;
  form: EditExpenseForm;
  onFormChange: (patch: Partial<EditExpenseForm>) => void;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={() => (isSaving ? undefined : onClose())}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" } } }}
    >
      <DialogTitle sx={{ fontWeight: 800, color: "var(--color-ink)" }}>Edit expense</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        <TextField
          label="Title"
          value={form.title}
          onChange={(event) => onFormChange({ title: event.target.value })}
          required
          fullWidth
        />
        <TextField
          label="Amount"
          type="number"
          value={form.totalAmount}
          onChange={(event) => onFormChange({ totalAmount: event.target.value })}
          required
          fullWidth
          slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
        />
        <TextField
          label="Description"
          value={form.note}
          onChange={(event) => onFormChange({ note: event.target.value })}
          fullWidth
          multiline
          rows={3}
        />
        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isSaving} sx={{ textTransform: "none", fontWeight: 700, color: "var(--color-ink)" }}>
          Cancel
        </Button>
        <Button
          onClick={onSave}
          disabled={isSaving}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            bgcolor: "var(--color-accent)",
            color: "var(--color-accent-contrast)",
            "&:hover": { bgcolor: "var(--color-accent)", filter: "brightness(0.92)" },
          }}
        >
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
