import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useAppState } from "../../app/AppStateContext";

export function VerifyEmailPage() {
  const { verifyEmail, resendVerificationCode, notice, setNotice } = useAppState();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const emailFromQuery = searchParams.get("email") ?? "";

    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [searchParams]);

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsVerifying(true);

    try {
      await verifyEmail({ email, code });
      setNotice({ tone: "success", message: "Email verified. You can now sign in." });
      navigate(`/login?email=${encodeURIComponent(email)}`, { replace: true });
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Verification failed.",
      });
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    if (!email) {
      setNotice({ tone: "warning", message: "Enter your email address first." });
      return;
    }

    setIsResending(true);

    try {
      await resendVerificationCode(email);
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Could not resend the code.",
      });
    } finally {
      setIsResending(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        py: 4,
        background:
          "radial-gradient(circle at top left, rgba(99,102,241,0.16), transparent 32%), radial-gradient(circle at bottom right, rgba(16,185,129,0.14), transparent 28%), linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={4}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid rgba(99,102,241,0.12)",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(18px)",
          }}
        >
          <Box
            sx={{
              px: 4,
              py: 3,
              background: "linear-gradient(135deg, #1e293b 0%, #4f46e5 100%)",
              color: "white",
            }}
          >
            <Typography variant="overline" sx={{ letterSpacing: "0.16em", opacity: 0.8 }}>
              Email verification
            </Typography>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mt: 0.5 }}>
              Enter the 6-digit code
            </Typography>
            <Typography sx={{ mt: 1, maxWidth: 440, color: "rgba(255,255,255,0.8)" }}>
              We sent a verification code to your email. Enter it below to activate your account.
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Stack spacing={2.25} component="form" onSubmit={handleVerify}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
              <TextField
                fullWidth
                label="Verification code"
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                slotProps={{
                  htmlInput: {
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    maxLength: 6,
                  },
                }}
                helperText="Check your inbox and enter the 6-digit code."
              />

              {notice.message && (
                <Alert severity={notice.tone === "idle" ? "info" : notice.tone}>
                  {notice.message}
                </Alert>
              )}

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isVerifying || !email || code.length !== 6}
                  sx={{ py: 1.4, fontWeight: 700 }}
                >
                  {isVerifying ? "Verifying..." : "Verify email"}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  fullWidth
                  disabled={isResending || !email}
                  onClick={handleResend}
                  sx={{ py: 1.4, fontWeight: 700 }}
                >
                  {isResending ? "Resending..." : "Resend code"}
                </Button>
              </Stack>

              <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", mt: 1 }}>
                Already verified?{" "}
                <Link href="/login" underline="hover" sx={{ fontWeight: 700 }}>
                  Sign in
                </Link>
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
