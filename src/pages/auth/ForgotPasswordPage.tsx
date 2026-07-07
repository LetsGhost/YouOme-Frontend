import { FormEvent, useState } from "react";
import { Box, Button, Container, Paper, TextField, Typography, Link, Alert, CircularProgress } from "@mui/material";
import { useAppState } from "../../app/AppStateContext";
import { useThemeMode } from "../../app/ThemeModeContext";
import { ThemeToggle } from "../../widgets/layout/ThemeToggle";
import { forgotPassword } from "../../shared/api/backend";

export function ForgotPasswordPage() {
  const { backendUrl } = useAppState();
  const { mode } = useThemeMode();
  const [email, setEmail] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    setError("");

    try {
      await forgotPassword(backendUrl, { email });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        py: 4,
        px: 2,
      }}
    >
      <Box sx={{ position: "fixed", top: 16, right: 16, zIndex: 10 }}>
        <ThemeToggle />
      </Box>

      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: "var(--radius-lg)",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <Box
            component="img"
            src={mode === "dark" ? "/AppIcon/Variant2Light.svg" : "/AppIcon/Variant2Dark.svg"}
            alt="YouOme"
            sx={{ display: "block", width: 64, height: 64, mx: "auto", mb: 2, borderRadius: "50%" }}
          />
          <Typography variant="h3" component="h1" sx={{ mb: 1, fontWeight: 700, color: "var(--color-ink)", textAlign: "center" }}>
            Forgot password
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, textAlign: "center", color: "var(--color-muted)" }}>
            Enter your email and we'll send you a link to reset it
          </Typography>

          {submitted ? (
            <Alert severity="success">
              If that account exists, a password reset link has been sent. Check your inbox.
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              {error && <Alert severity="error">{error}</Alert>}

              <Button type="submit" fullWidth variant="contained" disabled={isBusy} sx={{ py: 1.5, fontSize: "1rem", fontWeight: 600 }}>
                {isBusy ? <CircularProgress size={20} /> : "Send reset link"}
              </Button>
            </Box>
          )}

          <Typography variant="body2" sx={{ textAlign: "center", color: "var(--color-muted)", mt: 3 }}>
            Remembered it?{" "}
            <Link
              href="/login"
              sx={{ color: "var(--color-accent-strong-ink)", fontWeight: 600, textDecoration: "none", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
            >
              Back to sign in
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
