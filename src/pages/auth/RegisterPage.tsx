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
import { useNavigate } from "react-router-dom";
import { useAppState } from "../../app/AppStateContext";

export function RegisterPage() {
  const { register, notice, setNotice } = useAppState();
  const [form, setForm] = useState({ email: "", name: "", password: "" });
  const [isBusy, setIsBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);

    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setNotice({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Registration failed.",
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
        <Card
          elevation={3}
          sx={{
            borderRadius: 2,
            background: "#ffffff",
          }}
        >
          <CardContent sx={{ p: 4 }}>
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
              Create account
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 4,
                textAlign: "center",
                color: "#64748b",
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
                minLength={8}
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="••••••••"
                variant="outlined"
                helperText="Minimum 8 characters"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {notice.message && (
                <Alert severity={notice.tone === "error" ? "error" : "warning"}>
                  {notice.message}
                </Alert>
              )}

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
                  backgroundColor: "#6366f1",
                  "&:hover": {
                    backgroundColor: "#4f46e5",
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
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}