import LockIcon from "@mui/icons-material/Lock";
import { Box, Button, Card, CardContent, Chip, TextField, Typography } from "@mui/material";

import type { CurrentUser } from "../../shared/api/backend";
import { resolveAvatarUrl } from "../../shared/api/backend";
import { AvatarUploader } from "../../widgets/avatar/AvatarUploader";

export function AccountInfoCard({
  currentUser,
  backendUrl,
  accessToken,
  name,
  onNameChange,
  email,
  onEmailChange,
  isProfileDirty,
  isSavingProfile,
  onSaveProfile,
  onOpenPasswordDialog,
  onUploadAvatar,
  onRemoveAvatar,
}: {
  currentUser: CurrentUser | null;
  backendUrl: string;
  accessToken?: string;
  name: string;
  onNameChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  isProfileDirty: boolean;
  isSavingProfile: boolean;
  onSaveProfile: () => void;
  onOpenPasswordDialog: () => void;
  onUploadAvatar: (file: File) => Promise<void>;
  onRemoveAvatar: () => Promise<void>;
}) {
  return (
    <Card sx={{ borderRadius: "var(--radius-md)" }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: "var(--color-ink)" }}>
          Account Information
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <AvatarUploader
            src={resolveAvatarUrl(backendUrl, currentUser?.avatarUrl)}
            token={accessToken}
            fallback={currentUser?.name?.[0] || currentUser?.email?.[0] || "?"}
            size={72}
            editable
            onUpload={onUploadAvatar}
            onRemove={onRemoveAvatar}
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
            onChange={(event) => onNameChange(event.target.value)}
            fullWidth
            size="small"
          />

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            fullWidth
            size="small"
          />

          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              onClick={onSaveProfile}
              disabled={!isProfileDirty || isSavingProfile}
              sx={{ textTransform: "none", fontWeight: "bold" }}
            >
              {isSavingProfile ? "Saving..." : "Save changes"}
            </Button>

            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={onOpenPasswordDialog}
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
  );
}
