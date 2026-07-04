import type { FormEvent } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  MenuItem,
  TextField,
} from "@mui/material";

import type { Group } from "../../shared/api/backend";

export type NewExpenseForm = {
  groupId: string;
  title: string;
  amount: string;
  paidBy: string;
  description: string;
};

export function CreateExpenseDialog({
  open,
  onClose,
  groups,
  newExpense,
  onChange,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onClose: () => void;
  groups: Group[];
  newExpense: NewExpenseForm;
  onChange: (patch: Partial<NewExpenseForm>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: "var(--color-ink)" }}>New Expense</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            select
            label="Group"
            value={newExpense.groupId}
            onChange={(event) => onChange({ groupId: event.target.value })}
            required
            fullWidth
          >
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Title"
            value={newExpense.title}
            onChange={(event) => onChange({ title: event.target.value })}
            required
            fullWidth
          />
          <TextField
            label="Amount"
            type="number"
            value={newExpense.amount}
            onChange={(event) => onChange({ amount: event.target.value })}
            required
            fullWidth
            slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
          />
          <TextField
            label="Paid by"
            value={newExpense.paidBy}
            onChange={(event) => onChange({ paidBy: event.target.value })}
            fullWidth
            helperText="Use a member id or leave empty to default to your current user id."
          />
          <TextField
            label="Description"
            value={newExpense.description}
            onChange={(event) => onChange({ description: event.target.value })}
            fullWidth
            multiline
            rows={3}
          />
          <FormHelperText sx={{ m: 0, color: "var(--color-muted)" }}>
            This uses the real <code>/api/expenses</code> create endpoint.
          </FormHelperText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} sx={{ color: "var(--color-muted)" }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{
              bgcolor: "var(--color-accent)",
              color: "var(--color-accent-contrast)",
              "&:hover": { bgcolor: "var(--color-accent)", opacity: 0.9 },
            }}
          >
            {isSubmitting ? "Creating..." : "Create Expense"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
