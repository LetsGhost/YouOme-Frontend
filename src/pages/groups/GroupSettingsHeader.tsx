import { ChevronLeft, Users } from "lucide-react";
import { Box, IconButton, Typography } from "@mui/material";

import { resolveAvatarUrl } from "../../shared/api/backend";
import { AvatarUploader } from "../../widgets/avatar/AvatarUploader";

export function GroupSettingsHeader({
  backendUrl,
  avatarUrl,
  accessToken,
  isOwnerOrAdmin,
  onBack,
  onUploadAvatar,
  onRemoveAvatar,
}: {
  backendUrl: string;
  avatarUrl: string | null | undefined;
  accessToken?: string;
  isOwnerOrAdmin: boolean;
  onBack: () => void;
  onUploadAvatar: (file: File) => Promise<void>;
  onRemoveAvatar: () => Promise<void>;
}) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, pb: 2, borderBottom: "1px solid var(--color-border)" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
        <IconButton onClick={onBack} sx={{ color: "var(--color-muted)", "&:hover": { color: "var(--color-ink)" } }}>
          <ChevronLeft size={22} strokeWidth={2} />
        </IconButton>
        <AvatarUploader
          src={resolveAvatarUrl(backendUrl, avatarUrl)}
          token={accessToken}
          fallback={<Users size={24} strokeWidth={2} />}
          size={56}
          shape="rounded"
          editable={isOwnerOrAdmin}
          onUpload={onUploadAvatar}
          onRemove={onRemoveAvatar}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.4, color: "var(--color-ink)" }}>
            Group settings
          </Typography>
        </Box>
      </Box>

      <IconButton
        onClick={onBack}
        aria-label="Back to group"
        sx={{
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          color: "var(--color-ink)",
          flexShrink: 0,
        }}
      >
        <ChevronLeft size={18} strokeWidth={2} />
      </IconButton>
    </Box>
  );
}
