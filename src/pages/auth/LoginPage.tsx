import { FormEvent, useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Container,
  Typography,
  Paper,
  Link,
  Alert,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useAppState } from "../../app/AppStateContext";
import { useThemeMode } from "../../app/ThemeModeContext";
import { ThemeToggle } from "../../widgets/layout/ThemeToggle";
import { resendVerification } from "../../shared/api/backend";

export function LoginPage() {
  const { login, backendUrl } = useAppState();
  const { mode } = useThemeMode();
  const [form, setForm] = useState({ email: "", password: "", rememberMe: false });
  const [isBusy, setIsBusy] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [resendState, setResendState] = useState<"idle" | "busy" | "sent">("idle");
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const locationState = location.state as { from?: string; email?: string } | null;
  const isUnverified = loginError === "Email not verified";

  useEffect(() => {
    const email = searchParams.get("email") || locationState?.email;

    if (email) {
      setForm((current) => (current.email ? current : { ...current, email }));
    }
  }, [locationState?.email, searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    setLoginError("");

    try {
      await login(form);
      // PublicOnlyRoute takes over from here: it shows the splash screen
      // while isLoginSplashActive is set, then redirects once it clears.
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed.";

      setLoginError(message);
      setResendState("idle");
      setIsBusy(false);
    }
  }

  async function handleResend() {
    setResendState("busy");
    try {
      await resendVerification(backendUrl, form.email);
    } finally {
      setResendState("sent");
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
            sx={{
              display: "block",
              width: 64,
              height: 64,
              mx: "auto",
              mb: 2,
              borderRadius: "50%",
            }}
          />
          <Typography
            variant="h3"
            component="h1"
            sx={{
              mb: 1,
              fontWeight: 700,
              color: "var(--color-ink)",
              textAlign: "center",
            }}
          >
            Welcome back
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              textAlign: "center",
              color: "var(--color-muted)",
            }}
          >
            Sign in to your account
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              required
            />

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.rememberMe}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, rememberMe: event.target.checked }))
                    }
                  />
                }
                label="Remember me"
              />
              <Link
                href="/forgot-password"
                sx={{
                  color: "var(--color-accent-strong-ink)",
                  fontWeight: 600,
                  textDecoration: "none",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Forgot password?
              </Link>
            </Box>

            {loginError && (
              <Alert severity="error">
                {loginError}
                {isUnverified && (
                  <Box sx={{ mt: 1 }}>
                    {resendState === "sent" ? (
                      "If that account still needs verification, a new link has been sent."
                    ) : (
                      <Link
                        component="button"
                        type="button"
                        onClick={handleResend}
                        disabled={resendState === "busy"}
                        sx={{ fontWeight: 600, cursor: "pointer" }}
                      >
                        {resendState === "busy" ? "Sending..." : "Resend verification email"}
                      </Link>
                    )}
                  </Box>
                )}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isBusy}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
              }}
            >
              {isBusy ? "Signing in..." : "Sign in"}
            </Button>
          </Box>

          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              color: "var(--color-muted)",
              mt: 3,
            }}
          >
            Don't have an account?{" "}
            <Link
              href="/register"
              sx={{
                color: "var(--color-accent-strong-ink)",
                fontWeight: 600,
                textDecoration: "none",
                cursor: "pointer",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Sign up
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}