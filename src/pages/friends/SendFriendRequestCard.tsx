import { Mail, Send } from "lucide-react";
import { Box, Button, Card, CardContent, InputAdornment, TextField, Typography } from "@mui/material";

import { microLabelSx, outlinedFieldSx } from "./friendsStyles";

export function SendFriendRequestCard({
  inviteEmail,
  onInviteEmailChange,
  isSubmitting,
  onSendInvite,
}: {
  inviteEmail: string;
  onInviteEmailChange: (value: string) => void;
  isSubmitting: boolean;
  onSendInvite: () => void;
}) {
  return (
    <Card sx={{ bgcolor: "var(--color-surface-2)" }}>
      <CardContent sx={{ display: "grid", gap: 2 }}>
        <Box sx={{ display: "grid", gap: 0.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "var(--color-ink)" }}>
            Send a friend request
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
            Enter the email address the other person used to register.
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gap: 1 }}>
          <Typography sx={microLabelSx}>Friend email</Typography>
          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
              alignItems: "center",
            }}
          >
            <TextField
              fullWidth
              placeholder="friend@example.com"
              value={inviteEmail}
              onChange={(event) => onInviteEmailChange(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={18} color="var(--color-muted)" strokeWidth={1.8} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={outlinedFieldSx}
            />

            <Button
              variant="contained"
              onClick={onSendInvite}
              disabled={isSubmitting}
              startIcon={<Send size={18} strokeWidth={2} />}
              sx={{
                minHeight: 56,
                px: 3,
                fontWeight: 700,
                bgcolor: "var(--color-accent)",
                color: "var(--color-accent-contrast)",
                "&:hover": { bgcolor: "var(--color-accent)", opacity: 0.9 },
              }}
            >
              Send request
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
