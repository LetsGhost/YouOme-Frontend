import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import CampaignIcon from "@mui/icons-material/Campaign";
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
  IconButton,
  Typography,
} from "@mui/material";

import { CHANGELOG, CURRENT_CHANGELOG_VERSION } from "../../shared/changelog";
import { getSeenChangelogVersion, setSeenChangelogVersion } from "../../shared/api/backend";

export function ChangelogDialog() {
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    setOpen(getSeenChangelogVersion() !== CURRENT_CHANGELOG_VERSION);
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      setSeenChangelogVersion(CURRENT_CHANGELOG_VERSION);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 800 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CampaignIcon sx={{ color: "var(--color-accent)" }} />
          What's new
        </Box>
        <IconButton onClick={handleClose} size="small" aria-label="Close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {CHANGELOG.map((entry) => (
          <Box key={entry.version} sx={{ mb: 3, "&:last-of-type": { mb: 0 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {entry.title}
              </Typography>
              <Chip
                label={entry.version}
                size="small"
                sx={{
                  bgcolor: "var(--color-accent-soft-bg)",
                  color: "var(--color-accent-soft-ink)",
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
              {entry.date}
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {entry.changes.map((change, idx) => (
                <Typography key={idx} component="li" variant="body2" sx={{ mb: 0.5 }}>
                  {change}
                </Typography>
              ))}
            </Box>
          </Box>
        ))}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={dontShowAgain}
              onChange={(event) => setDontShowAgain(event.target.checked)}
              size="small"
            />
          }
          label="Don't show again"
        />
        <Button onClick={handleClose} variant="contained" sx={{ textTransform: "none", fontWeight: 700 }}>
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
}
