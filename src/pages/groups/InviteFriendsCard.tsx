import { Search, UserPlus } from "lucide-react";
import { Box, Button, Card, CardContent, Divider, InputAdornment, Skeleton, TextField, Typography } from "@mui/material";

import { resolveAvatarUrl, type FriendSummary } from "../../shared/api/backend";
import { AvatarUploader } from "../../widgets/avatar/AvatarUploader";
import { noop, resolveFriendKey } from "./groupSettingsHelpers";

export function InviteFriendsCard({
  isLoading,
  friends,
  searchTerm,
  onSearchTermChange,
  sentInvites,
  isSaving,
  backendUrl,
  accessToken,
  onInviteFriend,
}: {
  isLoading: boolean;
  friends: FriendSummary[];
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  sentInvites: Record<string, boolean>;
  isSaving: boolean;
  backendUrl: string;
  accessToken?: string;
  onInviteFriend: (friend: FriendSummary) => void;
}) {
  return (
    <Card sx={{ borderRadius: "var(--radius-md)" }}>
      <CardContent sx={{ display: "grid", gap: 2 }}>
        <Box sx={{ display: "grid", gap: 0.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "var(--color-ink)" }}>
            Invite friends
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
            Pick a friend from your list and send them a group invite.
          </Typography>
        </Box>

        <TextField
          fullWidth
          size="small"
          placeholder="Search friends"
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} strokeWidth={2} color="var(--color-muted)" />
                </InputAdornment>
              ),
            },
          }}
        />

        <Divider sx={{ borderColor: "var(--color-border)" }} />

        {isLoading ? (
          <Box sx={{ display: "grid", gap: 1.5 }}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" height={88} />
            ))}
          </Box>
        ) : friends.length > 0 ? (
          <Box sx={{ display: "grid", gap: 1.5 }}>
            {friends.map((friend) => {
              const isSent = Boolean(sentInvites[resolveFriendKey(friend)]);

              return (
                <Box
                  key={friend.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1.5,
                    borderRadius: "var(--radius-md)",
                    bgcolor: "var(--color-surface-2)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <AvatarUploader
                    src={resolveAvatarUrl(backendUrl, friend.avatarUrl)}
                    token={accessToken}
                    fallback={friend.name?.[0] || friend.email?.[0] || "?"}
                    size={40}
                    onUpload={noop}
                    onRemove={noop}
                  />

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--color-ink)" }} noWrap>
                      {friend.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "var(--color-muted)" }} noWrap>
                      {friend.email}
                    </Typography>
                  </Box>

                  <Button
                    startIcon={<UserPlus size={16} strokeWidth={2} />}
                    onClick={() => onInviteFriend(friend)}
                    disabled={isSaving || isSent || friend.blocked}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      bgcolor: "var(--color-accent)",
                      color: "var(--color-accent-contrast)",
                      "&:hover": { bgcolor: "var(--color-accent)", filter: "brightness(0.92)" },
                      "&.Mui-disabled": {
                        bgcolor: "var(--color-surface-3)",
                        color: "var(--color-muted)",
                      },
                    }}
                  >
                    {isSent ? "Invited" : friend.blocked ? "Blocked" : "Invite"}
                  </Button>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <UserPlus size={48} strokeWidth={1.8} color="var(--color-muted-3)" style={{ marginBottom: 8 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, color: "var(--color-ink)" }}>
              No friends available
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
              Add friends first, then invite them into the group from here.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
