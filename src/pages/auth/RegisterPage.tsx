import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, PersonAdd } from "@mui/icons-material";
import { FormEvent, useState } from "react";
import { useAppState } from "../../app/AppStateContext";
import { useThemeMode } from "../../app/ThemeModeContext";
import { ThemeToggle } from "../../widgets/layout/ThemeToggle";
import { resendVerification } from "../../shared/api/backend";

export function RegisterPage() {
  const { register, backendUrl } = useAppState();
  const { mode } = useThemeMode();
  const [form, setForm] = useState({ email: "", name: "", password: "" });
  const [isBusy, setIsBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resendState, setResendState] = useState<"idle" | "busy" | "sent">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    setFormError("");

    try {
      const result = await register(form);
      setRegisteredEmail(result.email);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleResend() {
    setResendState("busy");
    try {
      await resendVerification(backendUrl, registeredEmail);
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
        <Card
          elevation={0}
          sx={{
            borderRadius: "var(--radius-lg)",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box
              component="img"
              src={mode === "dark" ? "/AppIcon/Variant2Dark.svg" : "/AppIcon/Variant2Light.svg"}
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
            {registeredEmail ? (
              <>
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{ mb: 1, fontWeight: 700, color: "var(--color-ink)", textAlign: "center" }}
                >
                  Check your inbox
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, textAlign: "center", color: "var(--color-muted)" }}>
                  We sent a verification link to <strong>{registeredEmail}</strong>. Click it to finish creating
                  your account, then come back and sign in.
                </Typography>

                {resendState === "sent" ? (
                  <Alert severity="success">If that account still needs verification, a new link has been sent.</Alert>
                ) : (
                  <Button
                    fullWidth
                    variant="outlined"
                    disabled={resendState === "busy"}
                    onClick={handleResend}
                    sx={{ mb: 2 }}
                  >
                    {resendState === "busy" ? <CircularProgress size={20} /> : "Resend verification email"}
                  </Button>
                )}

                <Typography variant="body2" sx={{ textAlign: "center", color: "var(--color-muted)" }}>
                  <Link
                    href="/login"
                    sx={{
                      color: "var(--color-accent-strong-ink)",
                      fontWeight: 600,
                      textDecoration: "none",
                      cursor: "pointer",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    Back to sign in
                  </Link>
                </Typography>
              </>
            ) : (
              <>
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
              Create account
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 4,
                textAlign: "center",
                color: "var(--color-muted)",
              }}
            >
              Join YouOme and start managing finances
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
                label="Full Name"
                type="text"
                required
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="John Doe"
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                required
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="you@example.com"
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="••••••••"
                variant="outlined"
                helperText="Minimum 8 characters"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {formError && <Alert severity="error">{formError}</Alert>}

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={isBusy}
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                  backgroundColor: "var(--color-accent)",
                  color: "var(--color-accent-contrast)",
                  "&:hover": {
                    backgroundColor: "var(--color-accent)",
                    filter: "brightness(0.92)",
                  },
                }}
              >
                {isBusy ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Creating account...
                  </>
                ) : (
                  <>
                    <PersonAdd sx={{ mr: 1 }} />
                    Create account
                  </>
                )}
              </Button>
            </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}