import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Button, Container, Paper, Typography, Link, Alert, CircularProgress } from "@mui/material";
import { useAppState } from "../../app/AppStateContext";
import { useThemeMode } from "../../app/ThemeModeContext";
import { ThemeToggle } from "../../widgets/layout/ThemeToggle";
import { verifyEmail } from "../../shared/api/backend";

// Deliberately does NOT fire on mount: some mail clients prefetch/scan links before a user
// clicks them, which would burn a single-use token before the person ever sees this page.
// Only the explicit button click below calls the backend.
export function VerifyEmailPage() {
  const { backendUrl } = useAppState();
  const { mode } = useThemeMode();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);

  async function handleConfirm() {
    setIsBusy(true);
    setError("");

    try {
      await verifyEmail(backendUrl, token);
      setVerified(true);
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
            textAlign: "center",
          }}
        >
          <Box
            component="img"
            src={mode === "dark" ? "/AppIcon/Variant2Light.svg" : "/AppIcon/Variant2Dark.svg"}
            alt="YouOme"
            sx={{ display: "block", width: 64, height: 64, mx: "auto", mb: 2, borderRadius: "50%" }}
          />
          <Typography variant="h3" component="h1" sx={{ mb: 1, fontWeight: 700, color: "var(--color-ink)" }}>
            Verify your email
          </Typography>

          {!token ? (
            <Alert severity="error" sx={{ mt: 3, textAlign: "left" }}>
              This verification link is missing its token. Request a new one below.
            </Alert>
          ) : verified ? (
            <Alert severity="success" sx={{ mt: 3, textAlign: "left" }}>
              Your email is verified. You can now sign in.
            </Alert>
          ) : (
            <>
              <Typography variant="body1" sx={{ mb: 3, color: "var(--color-muted)" }}>
                Click below to confirm your email address and finish creating your account.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2, textAlign: "left" }}>
                  {error}
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                disabled={isBusy}
                onClick={handleConfirm}
                sx={{ py: 1.5, fontSize: "1rem", fontWeight: 600 }}
              >
                {isBusy ? <CircularProgress size={20} /> : "Confirm email"}
              </Button>
            </>
          )}

          <Typography variant="body2" sx={{ color: "var(--color-muted)", mt: 3 }}>
            {verified ? (
              <Link
                href="/login"
                sx={{ color: "var(--color-accent-strong-ink)", fontWeight: 600, textDecoration: "none", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
              >
                Go to sign in
              </Link>
            ) : (
              <>
                Link expired or already used?{" "}
                <Link
                  href="/login"
                  sx={{ color: "var(--color-accent-strong-ink)", fontWeight: 600, textDecoration: "none", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                >
                  Try signing in to request a new one
                </Link>
              </>
            )}
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
