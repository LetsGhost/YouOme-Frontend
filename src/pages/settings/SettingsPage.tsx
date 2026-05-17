import { useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import WarningIcon from "@mui/icons-material/Warning";
import SaveIcon from "@mui/icons-material/Save";
import PublicIcon from "@mui/icons-material/Public";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Chip,
  Alert,
  Divider,
  Container,
  Paper,
} from "@mui/material";

import { useAppState } from "../../app/AppStateContext";

export function SettingsPage() {
  const { apiBaseUrl, setApiBaseUrl, currentUser, clearSession } = useAppState();
  const [draftBaseUrl, setDraftBaseUrl] = useState(apiBaseUrl);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveUrl = () => {
    setApiBaseUrl(draftBaseUrl);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleClearSession = () => {
    if (confirm("Are you sure you want to clear your session? You will be logged out.")) {
      clearSession();
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Header */}
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

        {/* Account Settings */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Account Information
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: "bold", display: "block", mb: 0.5 }}>
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
                  <Typography variant="body2">
                    {currentUser?.name || "Not set"}
                  </Typography>
                </Paper>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: "bold", display: "block", mb: 0.5 }}>
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
                  <Typography variant="body2">
                    {currentUser?.email || "Not set"}
                  </Typography>
                </Paper>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: "bold", display: "block", mb: 0.5 }}>
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

        {/* Backend Settings */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <PublicIcon sx={{ color: "#4f46e5", fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Backend Configuration
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <TextField
                  fullWidth
                  label="API Base URL"
                  value={draftBaseUrl}
                  onChange={(e) => setDraftBaseUrl(e.target.value)}
                  placeholder="http://localhost:3000"
                  variant="outlined"
                  size="small"
                />
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
                  Used for all API requests from this browser
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveUrl}
                  sx={{
                    bgcolor: "#4f46e5",
                    color: "white",
                    textTransform: "none",
                    fontWeight: "bold",
                    "&:hover": {
                      bgcolor: "#4338ca",
                    },
                  }}
                >
                  {isSaved ? "Saved!" : "Save URL"}
                </Button>

                {isSaved && (
                  <Typography variant="caption" sx={{ color: "#22c55e", fontWeight: "bold" }}>
                    ✓ Configuration updated
                  </Typography>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Danger Zone */}
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

          <Button
            variant="contained"
            startIcon={<LogoutIcon />}
            onClick={handleClearSession}
            sx={{
              bgcolor: "#dc2626",
              color: "white",
              textTransform: "none",
              fontWeight: "bold",
              "&:hover": {
                bgcolor: "#b91c1c",
              },
            }}
          >
            Clear session & logout
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}