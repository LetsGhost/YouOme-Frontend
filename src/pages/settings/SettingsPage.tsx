import { useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import WarningIcon from "@mui/icons-material/Warning";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ArticleIcon from "@mui/icons-material/Article";
import ShieldIcon from "@mui/icons-material/Shield";
import LockIcon from "@mui/icons-material/Lock";
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useAppState } from "../../app/AppStateContext";
import {
  changePassword,
  deleteUserAvatar,
  resolveAvatarUrl,
  updateProfile,
  uploadUserAvatar,
} from "../../shared/api/backend";
import { AvatarUploader } from "../../widgets/avatar/AvatarUploader";

export function SettingsPage() {
  const navigate = useNavigate();
  const { currentUser, backendUrl, session, deleteCurrentUser, updateCurrentUser, setNotice } = useAppState();
  const [isDeleting, setIsDeleting] = useState(false);

  const [name, setName] = useState(currentUser?.name ?? "");
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const isProfileDirty = name !== (currentUser?.name ?? "") || email !== (currentUser?.email ?? "");

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const updated = await updateProfile(backendUrl, { name, email }, session?.accessToken);
      updateCurrentUser(updated);
      setNotice({ tone: "success", message: "Profile updated." });
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Failed to update profile." });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleOpenPasswordDialog = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(null);
    setIsPasswordDialogOpen(true);
  };

  const handleClosePasswordDialog = () => {
    if (isChangingPassword) return;
    setIsPasswordDialogOpen(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setPasswordError(null);
    setIsChangingPassword(true);

    try {
      await changePassword(backendUrl, { currentPassword, newPassword }, session?.accessToken);
      setNotice({ tone: "success", message: "Password changed." });
      setIsPasswordDialogOpen(false);
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Failed to change password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleUploadAvatar = async (file: File) => {
    try {
      const updated = await uploadUserAvatar(backendUrl, file, session?.accessToken);
      updateCurrentUser(updated);
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Failed to upload avatar." });
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const updated = await deleteUserAvatar(backendUrl, session?.accessToken);
      updateCurrentUser(updated);
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Failed to remove avatar." });
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
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              width: 56,
              height: 56,
              borderRadius: "var(--radius-md)",
              bgcolor: "var(--color-accent-soft-bg)",
              flexShrink: 0,
            }}
          >
            <SettingsIcon sx={{ fontSize: 28, color: "var(--color-accent-soft-ink)" }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "var(--color-ink)" }}>
              Settings
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
              Configure your account and application preferences
            </Typography>
          </Box>
        </Box>

        <Card sx={{ borderRadius: "var(--radius-md)" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: "var(--color-ink)" }}>
              Account Information
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <AvatarUploader
                src={resolveAvatarUrl(backendUrl, currentUser?.avatarUrl)}
                token={session?.accessToken}
                fallback={currentUser?.name?.[0] || currentUser?.email?.[0] || "?"}
                size={72}
                editable
                onUpload={handleUploadAvatar}
                onRemove={handleRemoveAvatar}
              />
              <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
                Upload a photo to personalize your profile. Recommended: a square image, at least
                256x256.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                fullWidth
                size="small"
              />

              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                fullWidth
                size="small"
              />

              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  onClick={handleSaveProfile}
                  disabled={!isProfileDirty || isSavingProfile}
                  sx={{ textTransform: "none", fontWeight: "bold" }}
                >
                  {isSavingProfile ? "Saving..." : "Save changes"}
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<LockIcon />}
                  onClick={handleOpenPasswordDialog}
                  sx={{ textTransform: "none", fontWeight: "bold" }}
                >
                  Change password
                </Button>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "var(--color-muted)",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  Role
                </Typography>
                <Chip
                  label={currentUser?.role || "User"}
                  sx={{
                    bgcolor: "var(--color-accent-soft-bg)",
                    color: "var(--color-accent-soft-ink)",
                    fontWeight: "bold",
                    borderRadius: "var(--radius-pill)",
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: "var(--radius-md)" }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <ShieldIcon sx={{ color: "var(--color-accent)", fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "var(--color-ink)" }}>
                Terms of Service & Data Safety
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <ArticleIcon sx={{ color: "var(--color-accent)", mt: 0.25 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.5, color: "var(--color-ink)" }}>
                    Terms of Service
                  </Typography>
                  <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
                    YouOme is intended for personal and small-group expense tracking. Keep your account
                    details accurate and use shared spaces responsibly.
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: "var(--color-border)" }} />

              <Box sx={{ display: "flex", gap: 1.5 }}>
                <ShieldIcon sx={{ color: "var(--color-success)", mt: 0.25 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.5, color: "var(--color-ink)" }}>
                    Data Safety
                  </Typography>
                  <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
                    Your session is stored locally in this browser. Deleting your account removes the
                    backend user record, invalidates cached access, and clears the local session.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Paper
          elevation={0}
          sx={{
            borderRadius: "var(--radius-md)",
            bgcolor: "var(--color-danger-soft-bg)",
            border: "1px solid var(--color-danger-border)",
            p: 3,
          }}
        >
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <WarningIcon sx={{ color: "var(--color-danger)", fontSize: 28, flexShrink: 0, mt: 0.5 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "var(--color-danger)", mb: 0.5 }}>
                Danger Zone
              </Typography>
              <Typography variant="body2" sx={{ color: "var(--color-danger)" }}>
                These actions cannot be undone
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<DeleteForeverIcon />}
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              sx={{
                borderColor: "var(--color-danger)",
                color: "var(--color-danger)",
                textTransform: "none",
                fontWeight: "bold",
                alignSelf: "flex-start",
                "&:hover": {
                  borderColor: "var(--color-danger)",
                  bgcolor: "var(--color-danger-soft-bg)",
                },
              }}
            >
              {isDeleting ? "Deleting..." : "Delete account"}
            </Button>
          </Box>
        </Paper>
      </Box>

      <Dialog open={isPasswordDialogOpen} onClose={handleClosePasswordDialog} fullWidth maxWidth="xs">
        <DialogTitle>Change password</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              fullWidth
              size="small"
              autoFocus
            />
            <TextField
              label="New password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              fullWidth
              size="small"
            />
            {passwordError && (
              <Typography variant="body2" sx={{ color: "var(--color-danger)" }}>
                {passwordError}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClosePasswordDialog} disabled={isChangingPassword} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
            sx={{ textTransform: "none", fontWeight: "bold" }}
          >
            {isChangingPassword ? "Changing..." : "Change password"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}