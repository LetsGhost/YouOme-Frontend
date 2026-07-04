import { Users } from "lucide-react";
import { Box, Chip, Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";

import type { CurrentUser, GroupMember } from "../../shared/api/backend";
import { MemberAvatar } from "./MemberAvatar";

export function GroupMembersDialog({
  open,
  onClose,
  members,
  backendUrl,
  accessToken,
  currentUser,
}: {
  open: boolean;
  onClose: () => void;
  members: GroupMember[];
  backendUrl: string;
  accessToken?: string;
  currentUser: CurrentUser | null;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: { sx: { borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" } },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 700, color: "var(--color-ink)" }}>
        <Users size={18} strokeWidth={2} color="var(--color-accent)" />
        Members
        <Chip
          label={members.length}
          size="small"
          sx={{ bgcolor: "var(--color-accent-soft-bg)", color: "var(--color-accent-soft-ink)", fontWeight: 700 }}
        />
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pb: 2 }}>
        {members.map((member) => (
          <Box
            key={member.id}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 1.5,
              borderRadius: "var(--radius-md)",
              bgcolor: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
            }}
          >
            <MemberAvatar backendUrl={backendUrl} token={accessToken} member={member} size={40} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "var(--color-ink)" }}>
                {member.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "var(--color-muted)" }}>
                {member.email || "No email available"}
              </Typography>
            </Box>
            {(member.id === currentUser?.id || member.email === currentUser?.email) && (
              <Chip
                label="You"
                size="small"
                sx={{ bgcolor: "var(--color-accent-soft-bg)", color: "var(--color-accent-soft-ink)" }}
              />
            )}
          </Box>
        ))}
        {members.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Users size={48} strokeWidth={1.8} color="var(--color-muted-3)" style={{ marginBottom: 8 }} />
            <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
              No members found in this group.
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
