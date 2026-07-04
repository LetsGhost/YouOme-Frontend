import { MessageSquareQuote, Pencil } from "lucide-react";
import { Box, Typography } from "@mui/material";

import type { CurrentUser } from "../../shared/api/backend";
import { resolveAvatarUrl } from "../../shared/api/backend";
import { formatMemberSince } from "../../shared/lib/format";
import { AvatarUploader } from "../../widgets/avatar/AvatarUploader";
import { microLabelSx } from "./profileStyles";

export function ProfileHeaderCard({
  currentUser,
  backendUrl,
  accessToken,
  onUploadAvatar,
  onRemoveAvatar,
  onEditBio,
}: {
  currentUser: CurrentUser | null;
  backendUrl: string;
  accessToken?: string;
  onUploadAvatar: (file: File) => Promise<void>;
  onRemoveAvatar: () => Promise<void>;
  onEditBio: () => void;
}) {
  const memberSince = formatMemberSince(currentUser?.createdAt);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
        <AvatarUploader
          src={resolveAvatarUrl(backendUrl, currentUser?.avatarUrl)}
          token={accessToken}
          fallback={currentUser?.name?.[0] || currentUser?.email?.[0] || "?"}
          size={56}
          shape="rounded"
          editable
          onUpload={onUploadAvatar}
          onRemove={onRemoveAvatar}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "1.15rem", color: "var(--color-ink)" }} noWrap>
            {currentUser?.name || "Friend"}
          </Typography>
          <Typography sx={{ ...microLabelSx, textTransform: "none", letterSpacing: 0, mt: 0.4 }}>
            {memberSince ? `Member since ${memberSince}` : currentUser?.email}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.6,
            flexShrink: 0,
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            fontSize: "10px",
            color: "var(--color-success)",
            border: "1px solid var(--color-success-border)",
            borderRadius: "var(--radius-pill)",
            px: 1.1,
            py: 0.4,
          }}
        >
          <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "var(--color-success)" }} />
          You
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          p: "12px 14px",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-sm)",
          bgcolor: "var(--color-surface-2)",
        }}
      >
        <MessageSquareQuote size={14} strokeWidth={2} color="var(--color-muted)" style={{ marginTop: 2, flexShrink: 0 }} />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: "12.5px",
              color: currentUser?.bio ? "var(--color-ink)" : "var(--color-muted)",
              fontStyle: "italic",
            }}
          >
            {currentUser?.bio ? `"${currentUser.bio}"` : "Add a bio to tell friends about yourself."}
          </Typography>
          <Typography sx={{ ...microLabelSx, mt: 0.5 }}>Visible to friends</Typography>
        </Box>

        <Box
          component="button"
          type="button"
          onClick={onEditBio}
          aria-label="Edit bio"
          sx={{
            all: "unset",
            cursor: "pointer",
            display: "flex",
            flexShrink: 0,
            color: "var(--color-muted)",
            mt: "2px",
            "&:hover": { color: "var(--color-ink)" },
          }}
        >
          <Pencil size={14} strokeWidth={2} />
        </Box>
      </Box>
    </Box>
  );
}
