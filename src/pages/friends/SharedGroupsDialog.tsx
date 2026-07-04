import { ChevronRight, Users, X } from "lucide-react";
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import type { Group } from "../../shared/api/backend";

export function SharedGroupsDialog({ open, onClose, groups }: { open: boolean; onClose: () => void; groups: Group[] }) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1.5 }}>
        Shared groups
        <IconButton size="small" onClick={onClose} aria-label="Close">
          <X size={17} strokeWidth={2.2} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {groups.map((group) => (
            <Box
              key={group.id}
              component="button"
              type="button"
              onClick={() => navigate(`/groups/${group.id}`)}
              sx={{
                all: "unset",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                width: "100%",
                py: 1.5,
                cursor: "pointer",
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-sm)",
                  bgcolor: "var(--color-accent-soft-bg)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <Users size={18} strokeWidth={1.8} color="var(--color-accent-soft-ink)" />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                <Typography sx={{ fontWeight: 600, fontSize: "13.5px", color: "var(--color-ink)" }} noWrap>
                  {group.name}
                </Typography>
                <Typography
                  sx={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-muted)", mt: 0.2 }}
                >
                  {group.memberCount ?? group.members?.length ?? 0} members
                </Typography>
              </Box>
              <ChevronRight size={15} strokeWidth={2} color="var(--color-muted)" />
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
