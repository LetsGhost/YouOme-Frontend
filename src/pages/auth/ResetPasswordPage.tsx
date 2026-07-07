import { FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Button, Container, Paper, TextField, Typography, Link, Alert, CircularProgress } from "@mui/material";
import { useAppState } from "../../app/AppStateContext";
import { useThemeMode } from "../../app/ThemeModeContext";
import { ThemeToggle } from "../../widgets/layout/ThemeToggle";
import { resetPassword } from "../../shared/api/backend";

export function ResetPasswordPage() {
  const { backendUrl } = useAppState();
  const { mode } = useThemeMode();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    setError("");

    try {
      await resetPassword(backendUrl, { token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 2000);
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
            Reset password
          </Typography>

          {!token ? (
            <Alert severity="error">This reset link is missing its token. Request a new one from the forgot-password page.</Alert>
          ) : success ? (
            <Alert severity="success">Password reset. Redirecting you to sign in...</Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}>
              <TextField
                fullWidth
                label="New password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                helperText="Minimum 8 characters"
              />

              {error && <Alert severity="error">{error}</Alert>}

              <Button type="submit" fullWidth variant="contained" disabled={isBusy} sx={{ py: 1.5, fontSize: "1rem", fontWeight: 600 }}>
                {isBusy ? <CircularProgress size={20} /> : "Reset password"}
              </Button>
            </Box>
          )}

          <Typography variant="body2" sx={{ textAlign: "center", color: "var(--color-muted)", mt: 3 }}>
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
