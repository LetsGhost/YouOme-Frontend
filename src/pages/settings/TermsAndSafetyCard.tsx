import ArticleIcon from "@mui/icons-material/Article";
import ShieldIcon from "@mui/icons-material/Shield";
import { Box, Card, CardContent, Divider, Typography } from "@mui/material";

export function TermsAndSafetyCard() {
  return (
    <Card sx={{ borderRadius: "var(--radius-md)" }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <ShieldIcon sx={{ color: "var(--color-accent)", fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "var(--color-ink)" }}>
            Terms of Service & Data Safety
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <ArticleIcon sx={{ color: "var(--color-accent)", mt: 0.25 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.5, color: "var(--color-ink)" }}>
                Terms of Service
              </Typography>
              <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
                YouOme is intended for personal and small-group expense tracking. Keep your account
                details accurate and use shared spaces responsibly.
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: "var(--color-border)" }} />

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <ShieldIcon sx={{ color: "var(--color-success)", mt: 0.25 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.5, color: "var(--color-ink)" }}>
                Data Safety
              </Typography>
              <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
                Your session is stored locally in this browser. Deleting your account removes the
                backend user record, invalidates cached access, and clears the local session.
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
