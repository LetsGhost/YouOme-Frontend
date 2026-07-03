import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import CampaignIcon from "@mui/icons-material/Campaign";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
  const [expandedVersion, setExpandedVersion] = useState<string | undefined>(CHANGELOG[0]?.version);

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

      <DialogContent dividers sx={{ p: 0 }}>
        {CHANGELOG.map((entry) => (
          <Accordion
            key={entry.version}
            expanded={expandedVersion === entry.version}
            onChange={(_event, isExpanded) => setExpandedVersion(isExpanded ? entry.version : undefined)}
            disableGutters
            elevation={0}
            square
            sx={{
              "&:before": { display: "none" },
              "&:not(:last-of-type)": { borderBottom: "1px solid var(--color-border, rgba(0,0,0,0.12))" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
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
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {entry.date}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pt: 0, pb: 2.5 }}>
              <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                {entry.highlights.map((change, idx) => (
                  <Typography key={idx} component="li" variant="body2" sx={{ mb: 0.5 }}>
                    {change}
                  </Typography>
                ))}
              </Box>

              {entry.minor.length > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                    Also included
                  </Typography>
                  <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2.5 }}>
                    {entry.minor.map((change, idx) => (
                      <Typography
                        key={idx}
                        component="li"
                        variant="caption"
                        sx={{ display: "list-item", color: "text.secondary", mb: 0.25 }}
                      >
                        {change}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
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
