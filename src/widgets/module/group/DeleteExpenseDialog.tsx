import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

export function DeleteExpenseDialog({
  open,
  expenseTitle,
  isDeleting,
  error,
  onClose,
  onConfirm,
}: {
  open: boolean;
  expenseTitle: string | undefined;
  isDeleting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={() => (isDeleting ? undefined : onClose())}
      slotProps={{ paper: { sx: { borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" } } }}
    >
      <DialogTitle sx={{ fontWeight: 800, color: "var(--color-ink)" }}>Delete {expenseTitle ?? "this expense"}?</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: "var(--color-muted)" }}>
          This action can't be undone. The expense and its participant shares will be permanently removed.
        </DialogContentText>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isDeleting} sx={{ textTransform: "none", fontWeight: 700, color: "var(--color-ink)" }}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isDeleting}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            bgcolor: "var(--color-danger)",
            color: "var(--color-accent-contrast)",
            "&:hover": { bgcolor: "var(--color-danger)", filter: "brightness(0.92)" },
          }}
        >
          {isDeleting ? "Deleting..." : "Delete expense"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
