import type { FormEvent } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import type { CurrentUser, GroupMember } from "../../shared/api/backend";
import { formatMoney } from "../../shared/lib/format";
import { ExpenseDraft, SplitType, getMemberLabel } from "./groupDetailsHelpers";

export function AddExpenseDialog({
  open,
  onClose,
  isPhoneScreen,
  members,
  currentUser,
  expenseData,
  onTitleChange,
  onAmountChange,
  onPaidByChange,
  onSplitTypeChange,
  onChargeSameAmountChange,
  onToggleParticipant,
  onParticipantShareChange,
  onDescriptionChange,
  previewMembers,
  previewShares,
  equalSplitHasRemainder,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  isPhoneScreen: boolean;
  members: GroupMember[];
  currentUser: CurrentUser | null;
  expenseData: ExpenseDraft;
  onTitleChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onPaidByChange: (value: string) => void;
  onSplitTypeChange: (value: SplitType) => void;
  onChargeSameAmountChange: (value: boolean) => void;
  onToggleParticipant: (memberId: string) => void;
  onParticipantShareChange: (memberId: string, value: string) => void;
  onDescriptionChange: (value: string) => void;
  previewMembers: GroupMember[];
  previewShares: Map<string, number>;
  equalSplitHasRemainder: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isPhoneScreen}
      slotProps={{
        paper: {
          sx: isPhoneScreen ? undefined : { borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--color-ink)" }}>Add Expense</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, py: 2 }}>
          <TextField
            label="Expense Title"
            fullWidth
            placeholder="e.g., Groceries, Rent"
            value={expenseData.title}
            onChange={(e) => onTitleChange(e.target.value)}
            required
          />
          <TextField
            label="Amount"
            fullWidth
            type="number"
            placeholder="0.00"
            slotProps={{ htmlInput: { step: "0.01", min: "0" } }}
            value={expenseData.amount}
            onChange={(e) => onAmountChange(e.target.value)}
            required
          />
          <TextField
            label="Paid By"
            select
            fullWidth
            value={expenseData.paidBy}
            onChange={(e) => onPaidByChange(e.target.value)}
            variant="outlined"
          >
            <MenuItem value={currentUser?.id || ""}>You</MenuItem>
            {members
              .filter((member) => member.id !== currentUser?.id)
              .map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name}
                </MenuItem>
              ))}
          </TextField>
          <TextField
            label="Split"
            select
            fullWidth
            value={expenseData.splitType}
            onChange={(e) => onSplitTypeChange(e.target.value as SplitType)}
          >
            <MenuItem value="equal">Equal split</MenuItem>
            <MenuItem value="percentage">By percentage</MenuItem>
            <MenuItem value="custom">Custom amounts</MenuItem>
          </TextField>
          {equalSplitHasRemainder && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={expenseData.chargeSameAmount}
                  onChange={(e) => onChargeSameAmountChange(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--color-ink)" }}>
                    Charge everyone the same rounded amount
                  </Typography>
                  <Typography variant="caption" sx={{ color: "var(--color-muted)" }}>
                    {expenseData.chargeSameAmount
                      ? "Everyone pays the same rounded share; you absorb the rounding difference yourself."
                      : "Off: shares are rounded fairly so they sum to the exact total (some people may pay 1 cent more than others)."}
                  </Typography>
                </Box>
              }
              sx={{ alignItems: "flex-start", ml: 0 }}
            />
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--color-ink)" }}>
              Who participated?
            </Typography>
            <Typography variant="caption" sx={{ color: "var(--color-muted)" }}>
              Pick everyone who should owe part of this expense. The payer's share is added automatically.
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {members.filter((member) => member.id !== expenseData.paidBy).map((member) => {
                const selected = expenseData.participantIds.includes(member.id);

                return (
                  <Chip
                    key={member.id}
                    label={getMemberLabel(member)}
                    clickable
                    variant={selected ? "filled" : "outlined"}
                    sx={
                      selected
                        ? { bgcolor: "var(--color-accent)", color: "var(--color-accent-contrast)" }
                        : { borderColor: "var(--color-border)", color: "var(--color-ink)" }
                    }
                    onClick={() => onToggleParticipant(member.id)}
                  />
                );
              })}
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--color-ink)" }}>
              Split preview
            </Typography>
            {previewMembers.length > 0 && Number(expenseData.amount) > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {expenseData.splitType === "equal" &&
                  previewMembers.map((member) => (
                    <Box
                      key={member.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 2,
                        bgcolor: member.id === expenseData.paidBy ? "var(--color-accent-soft-bg)" : "var(--color-surface-2)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-sm)",
                        px: 1.5,
                        py: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--color-ink)" }}>
                        {member.id === expenseData.paidBy ? `${getMemberLabel(member)} (paid upfront)` : getMemberLabel(member)}
                      </Typography>
                      <Typography sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--color-ink)" }}>
                        {formatMoney(previewShares.get(member.id) ?? 0)}
                      </Typography>
                    </Box>
                  ))}

                {expenseData.splitType === "percentage" && previewMembers.map((member) => (
                  <Box
                    key={member.id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 120px 120px",
                      gap: 1,
                      alignItems: "center",
                      bgcolor: member.id === expenseData.paidBy ? "var(--color-accent-soft-bg)" : "var(--color-surface-2)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                      px: 1.5,
                      py: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--color-ink)" }}>
                      {member.id === expenseData.paidBy ? `${getMemberLabel(member)} (paid upfront)` : getMemberLabel(member)}
                    </Typography>
                    {member.id === expenseData.paidBy ? (
                      <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
                        Included automatically
                      </Typography>
                    ) : (
                      <TextField
                        label="Percent"
                        type="number"
                        size="small"
                        value={expenseData.participantShares[member.id] ?? ""}
                        onChange={(event) => onParticipantShareChange(member.id, event.target.value)}
                        slotProps={{ htmlInput: { min: 0, max: 100, step: "0.01" } }}
                      />
                    )}
                    <Typography sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, textAlign: "right", color: "var(--color-ink)" }}>
                      {formatMoney(previewShares.get(member.id) ?? 0)}
                    </Typography>
                  </Box>
                ))}

                {expenseData.splitType === "custom" && previewMembers.map((member) => (
                  <Box
                    key={member.id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 160px",
                      gap: 1,
                      alignItems: "center",
                      bgcolor: member.id === expenseData.paidBy ? "var(--color-accent-soft-bg)" : "var(--color-surface-2)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                      px: 1.5,
                      py: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--color-ink)" }}>
                      {member.id === expenseData.paidBy ? `${getMemberLabel(member)} (paid upfront)` : getMemberLabel(member)}
                    </Typography>
                    {member.id === expenseData.paidBy ? (
                      <Typography sx={{ fontFamily: "var(--font-mono)", color: "var(--color-muted)", fontWeight: 700, textAlign: "right" }}>
                        {formatMoney(previewShares.get(member.id) ?? 0)}
                      </Typography>
                    ) : (
                      <TextField
                        label="Amount"
                        type="number"
                        size="small"
                        value={expenseData.participantShares[member.id] ?? ""}
                        onChange={(event) => onParticipantShareChange(member.id, event.target.value)}
                        slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
                Add an amount and participants to see the split breakdown.
              </Typography>
            )}
          </Box>
          <TextField
            label="Description (optional)"
            fullWidth
            multiline
            rows={3}
            placeholder="Add notes..."
            value={expenseData.description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} sx={{ color: "var(--color-ink)" }}>
            Cancel
          </Button>
          <Button
            type="submit"
            sx={{
              bgcolor: "var(--color-accent)",
              color: "var(--color-accent-contrast)",
              "&:hover": { bgcolor: "var(--color-accent)", filter: "brightness(0.92)" },
            }}
          >
            Add Expense
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
