import { Box, Card, CardActionArea, CardContent, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { resolveAvatarUrl, type FriendSummary } from "../../shared/api/backend";
import { AvatarUploader } from "../../widgets/avatar/AvatarUploader";
import { noop } from "./friendsUtils";

export function FriendCard({ friend, backendUrl, accessToken }: { friend: FriendSummary; backendUrl: string; accessToken?: string }) {
  const navigate = useNavigate();

  return (
    <Card
      variant="outlined"
      sx={{
        bgcolor: "var(--color-surface-2)",
        border: `1px solid ${friend.blocked ? "var(--color-warning-border)" : "var(--color-border)"}`,
        boxShadow: "none",
      }}
    >
      <CardActionArea onClick={() => navigate(`/friends/${friend.id}`)}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flex: 1, minWidth: 0 }}>
            <AvatarUploader
              src={resolveAvatarUrl(backendUrl, friend.avatarUrl)}
              token={accessToken}
              fallback={friend.name?.[0] || friend.email?.[0] || "?"}
              size={48}
              onUpload={noop}
              onRemove={noop}
            />

            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "var(--color-ink)" }} noWrap>
                {friend.name}
              </Typography>
              <Typography
                noWrap
                sx={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-muted)" }}
              >
                {friend.email}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.6,
                px: 1.2,
                py: 0.5,
                borderRadius: "var(--radius-pill)",
                border: `1px solid ${friend.blocked ? "var(--color-warning-border)" : "var(--color-success-border)"}`,
                bgcolor: friend.blocked ? "var(--color-warning-soft-bg)" : "var(--color-success-soft-bg)",
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: friend.blocked ? "var(--color-warning)" : "var(--color-success)",
                }}
              />
              <Typography
                sx={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: friend.blocked ? "var(--color-warning)" : "var(--color-success)",
                }}
              >
                {friend.blocked ? "Blocked" : "Active"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
      </CardActionArea>
    </Card>
  );
}
