import { ShieldCheck } from "lucide-react";
import { Alert, Box, Button, Card, CardContent, Divider, FormControlLabel, MenuItem, Switch, TextField, Typography } from "@mui/material";

import type { GroupPolicy, GroupPolicyFields } from "../../shared/api/backend";
import { LoadingBlock } from "../../shared/ui/InlineSpinner";

export function GroupPolicyCard({
  policy,
  isPolicyLoading,
  isPolicySaving,
  policyError,
  onFieldChange,
  onSave,
}: {
  policy: GroupPolicy | null;
  isPolicyLoading: boolean;
  isPolicySaving: boolean;
  policyError: string | null;
  onFieldChange: (field: keyof GroupPolicyFields, value: boolean | string) => void;
  onSave: () => void;
}) {
  return (
    <Card sx={{ borderRadius: "var(--radius-md)" }}>
      <CardContent sx={{ display: "grid", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ShieldCheck size={18} strokeWidth={2} color="var(--color-accent)" />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "var(--color-ink)" }}>
              Group policy
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
              Owner/admin-only rules that govern how this group behaves.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "var(--color-border)" }} />

        {policyError && <Alert severity="warning">{policyError}</Alert>}

        {isPolicyLoading || !policy ? (
          <LoadingBlock label="Loading policy…" />
        ) : (
          <Box sx={{ display: "grid", gap: 1.5 }}>
            <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={policy.canMembersInvite}
                    onChange={(event) => onFieldChange("canMembersInvite", event.target.checked)}
                  />
                }
                label="Members can invite others"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={policy.canEditorsAddExpense}
                    onChange={(event) => onFieldChange("canEditorsAddExpense", event.target.checked)}
                  />
                }
                label="Editors can add expenses"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={policy.canModeratorsAddExpense}
                    onChange={(event) => onFieldChange("canModeratorsAddExpense", event.target.checked)}
                  />
                }
                label="Moderators can add expenses"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={policy.canModeratorsEditSettlementSchedule}
                    onChange={(event) => onFieldChange("canModeratorsEditSettlementSchedule", event.target.checked)}
                  />
                }
                label="Moderators can edit the settlement schedule"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={policy.canViewParticipatedExpenseDetails}
                    onChange={(event) => onFieldChange("canViewParticipatedExpenseDetails", event.target.checked)}
                  />
                }
                label="Members can view details of expenses they're in"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={policy.requireReceiverConfirmationForSettlement}
                    onChange={(event) => onFieldChange("requireReceiverConfirmationForSettlement", event.target.checked)}
                  />
                }
                label="Require receiver confirmation for settlements"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={policy.allowMemberRoleSelfLeave}
                    onChange={(event) => onFieldChange("allowMemberRoleSelfLeave", event.target.checked)}
                  />
                }
                label="Members can leave the group themselves"
              />
            </Box>

            <TextField
              select
              label="Visibility mode"
              size="small"
              value={policy.visibilityMode}
              onChange={(event) => onFieldChange("visibilityMode", event.target.value)}
              helperText="Controls group visibility (no discovery feature consumes this yet)."
              sx={{ maxWidth: 320 }}
            >
              <MenuItem value="private">Private</MenuItem>
              <MenuItem value="global">Global</MenuItem>
            </TextField>

            <Box>
              <Button
                onClick={onSave}
                disabled={isPolicySaving}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: "var(--color-accent)",
                  color: "var(--color-accent-contrast)",
                  "&:hover": { bgcolor: "var(--color-accent)", filter: "brightness(0.92)" },
                }}
              >
                {isPolicySaving ? "Saving..." : "Save policy"}
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
