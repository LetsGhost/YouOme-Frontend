import { ChevronLeft, MessageSquareQuote } from "lucide-react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import type { CurrentUser } from "../../shared/api/backend";
import { resolveAvatarUrl } from "../../shared/api/backend";
import { formatMemberSince } from "../../shared/lib/format";
import { AvatarUploader } from "../../widgets/avatar/AvatarUploader";
import { microLabelSx } from "./friendsStyles";

export function FriendProfileHeaderCard({
  friend,
  isBlocked,
  backendUrl,
  accessToken,
}: {
  friend: CurrentUser | null;
  isBlocked: boolean;
  backendUrl: string;
  accessToken?: string;
}) {
  const navigate = useNavigate();
  const joined = formatMemberSince(friend?.createdAt);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box
        component="button"
        type="button"
        onClick={() => navigate("/friends")}
        sx={{
          all: "unset",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          color: "var(--color-muted)",
          "&:hover": { color: "var(--color-ink)" },
        }}
      >
        <ChevronLeft size={17} strokeWidth={2} />
        <Typography sx={{ fontWeight: 500, fontSize: "12.5px" }}>Back</Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
        <AvatarUploader
          src={resolveAvatarUrl(backendUrl, friend?.avatarUrl)}
          token={accessToken}
          fallback={friend?.name?.[0] || friend?.email?.[0] || "?"}
          size={56}
          shape="rounded"
          onUpload={async () => {}}
          onRemove={async () => {}}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "1.15rem", color: "var(--color-ink)" }} noWrap>
            {friend?.name || "Friend"}
          </Typography>
          <Typography sx={{ ...microLabelSx, textTransform: "none", letterSpacing: 0, mt: 0.4 }}>
            {joined ? `Joined ${joined}` : friend?.email}
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
            color: isBlocked ? "var(--color-warning)" : "var(--color-success)",
            border: `1px solid ${isBlocked ? "var(--color-warning-border)" : "var(--color-success-border)"}`,
            borderRadius: "var(--radius-pill)",
            px: 1.1,
            py: 0.4,
          }}
        >
          <Box
            sx={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              bgcolor: isBlocked ? "var(--color-warning)" : "var(--color-success)",
            }}
          />
          {isBlocked ? "Blocked" : "Active"}
        </Box>
      </Box>

      {friend?.bio && (
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
          <Typography sx={{ fontSize: "12.5px", color: "var(--color-ink)", fontStyle: "italic" }}>
            {`"${friend.bio}"`}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
