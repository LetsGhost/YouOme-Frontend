import { useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import WarningIcon from "@mui/icons-material/Warning";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ArticleIcon from "@mui/icons-material/Article";
import ShieldIcon from "@mui/icons-material/Shield";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Divider,
  Container,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useAppState } from "../../app/AppStateContext";

export function SettingsPage() {
  const navigate = useNavigate();
  const { currentUser, clearSession, deleteCurrentUser } = useAppState();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClearSession = () => {
    if (confirm("Are you sure you want to clear your session? You will be logged out.")) {
      clearSession();
      navigate("/login", { replace: true });
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("This will permanently delete your account. Continue?")) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteCurrentUser();
      navigate("/login", { replace: true });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete account.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <SettingsIcon sx={{ fontSize: 40, color: "#4f46e5" }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              Settings
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Configure your account and application preferences
            </Typography>
          </Box>
        </Box>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Account Information
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: "bold", display: "block", mb: 0.5 }}
                >
                  Name
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    bgcolor: "#f3f4f6",
                    border: "1px solid #e5e7eb",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2">{currentUser?.name || "Not set"}</Typography>
                </Paper>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: "bold", display: "block", mb: 0.5 }}
                >
                  Email
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    bgcolor: "#f3f4f6",
                    border: "1px solid #e5e7eb",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2">{currentUser?.email || "Not set"}</Typography>
                </Paper>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: "bold", display: "block", mb: 0.5 }}
                >
                  Role
                </Typography>
                <Chip
                  label={currentUser?.role || "User"}
                  sx={{
                    bgcolor: "#eef2ff",
                    color: "#4f46e5",
                    fontWeight: "bold",
                  }}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Button
              variant="outlined"
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                color: "text.primary",
              }}
            >
              Edit profile
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <ShieldIcon sx={{ color: "#4f46e5", fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Terms of Service & Data Safety
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <ArticleIcon sx={{ color: "#4f46e5", mt: 0.25 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.5 }}>
                    Terms of Service
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    YouOme is intended for personal and small-group expense tracking. Keep your account
                    details accurate and use shared spaces responsibly.
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Box sx={{ display: "flex", gap: 1.5 }}>
                <ShieldIcon sx={{ color: "#16a34a", mt: 0.25 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.5 }}>
                    Data Safety
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Your session is stored locally in this browser. Deleting your account removes the
                    backend user record, invalidates cached access, and clears the local session.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Paper
          sx={{
            borderRadius: 2,
            bgcolor: "#fef2f2",
            border: "2px solid #fecaca",
            p: 3,
          }}
        >
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <WarningIcon sx={{ color: "#dc2626", fontSize: 28, flexShrink: 0, mt: 0.5 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#7f1d1d", mb: 0.5 }}>
                Danger Zone
              </Typography>
              <Typography variant="body2" sx={{ color: "#be123c" }}>
                These actions cannot be undone
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Button
              variant="contained"
              startIcon={<LogoutIcon />}
              onClick={handleClearSession}
              sx={{
                bgcolor: "#dc2626",
                color: "white",
                textTransform: "none",
                fontWeight: "bold",
                alignSelf: "flex-start",
                "&:hover": {
                  bgcolor: "#b91c1c",
                },
              }}
            >
              Clear session & logout
            </Button>

            <Button
              variant="outlined"
              startIcon={<DeleteForeverIcon />}
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              sx={{
                borderColor: "#dc2626",
                color: "#dc2626",
                textTransform: "none",
                fontWeight: "bold",
                alignSelf: "flex-start",
                "&:hover": {
                  borderColor: "#b91c1c",
                  bgcolor: "rgba(220, 38, 38, 0.04)",
                },
              }}
            >
              {isDeleting ? "Deleting..." : "Delete account"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}