import { Users } from "lucide-react";
import { Box, Button, Card, CardContent, Chip, Divider, Typography } from "@mui/material";

import { resolveAvatarUrl, type CurrentUser, type GroupMember } from "../../shared/api/backend";
import { formatCount } from "../../shared/lib/format";
import { LoadingBlock } from "../../shared/ui/InlineSpinner";
import { AvatarUploader } from "../../widgets/avatar/AvatarUploader";
import { noop } from "./groupSettingsHelpers";

export function CurrentMembersCard({
  isLoading,
  members,
  backendUrl,
  accessToken,
  currentUser,
  isOwner = false,
  onChangeRole,
}: {
  isLoading: boolean;
  members: GroupMember[];
  backendUrl: string;
  accessToken?: string;
  currentUser: CurrentUser | null;
  isOwner?: boolean;
  onChangeRole?: (userId: string, role: "moderator" | "member") => void;
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
          <LoadingBlock label="Loading members…" />
        ) : members.length > 0 ? (
          <Box sx={{ display: "grid", gap: 1.25 }}>
            {members.map((member) => (
              <Box
                key={member.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1,
                  rowGap: 1,
                  p: 1.25,
                  borderRadius: "var(--radius-md)",
                  bgcolor: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, flex: "1 1 180px" }}>
                  <AvatarUploader
                    src={resolveAvatarUrl(backendUrl, member.avatarUrl)}
                    token={accessToken}
                    fallback={member.avatar || member.name?.[0] || "?"}
                    size={36}
                    onUpload={noop}
                    onRemove={noop}
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "var(--color-ink)" }} noWrap>
                      {member.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "var(--color-muted)" }} noWrap>
                      {member.email || "No email available"}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", ml: "auto" }}>
                  {member.role && member.role !== "owner" && (
                    <Chip
                      label={member.role}
                      size="small"
                      sx={{ textTransform: "capitalize", bgcolor: "var(--color-surface-2)" }}
                    />
                  )}
                  {(member.id === currentUser?.id || member.email === currentUser?.email) && (
                    <Chip
                      label="You"
                      size="small"
                      sx={{ bgcolor: "var(--color-accent-soft-bg)", color: "var(--color-accent-soft-ink)" }}
                    />
                  )}
                  {isOwner &&
                    onChangeRole &&
                    member.role !== "owner" &&
                    member.id !== currentUser?.id && (
                      <Button
                        size="small"
                        onClick={() => onChangeRole(member.id, member.role === "moderator" ? "member" : "moderator")}
                        sx={{ textTransform: "none", fontWeight: 700, whiteSpace: "nowrap" }}
                      >
                        {member.role === "moderator" ? "Demote" : "Promote"}
                      </Button>
                    )}
                </Box>
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
