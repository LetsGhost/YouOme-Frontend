import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Container,
  Typography,
  Paper,
  Link,
  Alert,
} from "@mui/material";
import { useAppState } from "../../app/AppStateContext";

export function LoginPage() {
  const { login, notice, setNotice } = useAppState();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isBusy, setIsBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const locationState = location.state as { from?: string; email?: string } | null;

  const returnTo = locationState?.from || "/dashboard";

  useEffect(() => {
    const email = searchParams.get("email") || locationState?.email;

    if (email) {
      setForm((current) => (current.email ? current : { ...current, email }));
    }
  }, [locationState?.email, searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);

    try {
      await login(form);
      navigate(returnTo, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed.";

      setNotice({
        tone: "error",
        message,
      });
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            background: "#ffffff",
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            sx={{
              mb: 1,
              fontWeight: 700,
              color: "#1e293b",
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
              color: "#64748b",
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

            {notice.message && (
              <Alert severity={notice.tone === "idle" ? "info" : notice.tone}>
                {notice.message}
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
              color: "#64748b",
              mt: 3,
            }}
          >
            Don't have an account?{" "}
            <Link
              href="/register"
              sx={{
                color: "primary.main",
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

          <Typography
            variant="caption"
            sx={{
              textAlign: "center",
              color: "#64748b",
              display: "block",
              mt: 3,
            }}
          >
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}