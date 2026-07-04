import { Users } from "lucide-react";
import { Box, Card, CardContent, Chip, Divider, Skeleton, Typography } from "@mui/material";

import { resolveAvatarUrl, type CurrentUser, type GroupMember } from "../../shared/api/backend";
import { formatCount } from "../../shared/lib/format";
import { AvatarUploader } from "../../widgets/avatar/AvatarUploader";
import { noop } from "./groupSettingsHelpers";

export function CurrentMembersCard({
  isLoading,
  members,
  backendUrl,
  accessToken,
  currentUser,
}: {
  isLoading: boolean;
  members: GroupMember[];
  backendUrl: string;
  accessToken?: string;
  currentUser: CurrentUser | null;
}) {
  return (
    <Card sx={{ borderRadius: "var(--radius-md)" }}>
      <CardContent sx={{ display: "grid", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Users size={18} strokeWidth={2} color="var(--color-accent)" />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "var(--color-ink)" }}>
              Current members
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
              {formatCount(members.length)} member{members.length === 1 ? "" : "s"}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "var(--color-border)" }} />

        {isLoading ? (
          <Box sx={{ display: "grid", gap: 1.5 }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" height={64} />
            ))}
          </Box>
        ) : members.length > 0 ? (
          <Box sx={{ display: "grid", gap: 1.25 }}>
            {members.map((member) => (
              <Box
                key={member.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.25,
                  borderRadius: "var(--radius-md)",
                  bgcolor: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <AvatarUploader
                  src={resolveAvatarUrl(backendUrl, member.avatarUrl)}
                  token={accessToken}
                  fallback={member.avatar || member.name?.[0] || "?"}
                  size={36}
                  onUpload={noop}
                  onRemove={noop}
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "var(--color-ink)" }} noWrap>
                    {member.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "var(--color-muted)" }} noWrap>
                    {member.email || "No email available"}
                  </Typography>
                </Box>
                {(member.id === currentUser?.id || member.email === currentUser?.email) && (
                  <Chip
                    label="You"
                    size="small"
                    sx={{ bgcolor: "var(--color-accent-soft-bg)", color: "var(--color-accent-soft-ink)" }}
                  />
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: "var(--color-muted)", textAlign: "center", py: 2 }}>
            No members found in this group.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
