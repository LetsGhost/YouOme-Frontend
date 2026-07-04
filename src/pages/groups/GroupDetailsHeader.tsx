import { ChevronLeft, Settings, Users } from "lucide-react";
import { AvatarGroup, Box, IconButton, Skeleton, Typography } from "@mui/material";

import { resolveAvatarUrl, type Group, type GroupMember } from "../../shared/api/backend";
import { AvatarUploader } from "../../widgets/avatar/AvatarUploader";
import { noop } from "./groupDetailsHelpers";
import { MemberAvatar } from "./MemberAvatar";

export function GroupDetailsHeader({
  isLoading,
  group,
  members,
  backendUrl,
  accessToken,
  onBack,
  onOpenSettings,
  onShowMembers,
}: {
  isLoading: boolean;
  group: Group | null;
  members: GroupMember[];
  backendUrl: string;
  accessToken?: string;
  onBack: () => void;
  onOpenSettings: () => void;
  onShowMembers: () => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 2,
        pb: 2,
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, minWidth: 0 }}>
        <IconButton
          onClick={onBack}
          sx={{ color: "var(--color-muted)", mt: "2px", "&:hover": { color: "var(--color-ink)" } }}
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </IconButton>
        {!isLoading && (
          <AvatarUploader
            src={resolveAvatarUrl(backendUrl, group?.avatarUrl)}
            token={accessToken}
            fallback={<Users size={24} strokeWidth={2} />}
            size={56}
            shape="rounded"
            onUpload={noop}
            onRemove={noop}
          />
        )}
        <Box sx={{ minWidth: 0 }}>
          {isLoading ? (
            <Skeleton variant="text" width={260} height={42} />
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "var(--color-ink)", fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
                {group?.name || "Group"}
              </Typography>
              <IconButton
                onClick={onOpenSettings}
                aria-label="Group settings"
                sx={{ color: "var(--color-muted)", "&:hover": { color: "var(--color-ink)" } }}
              >
                <Settings size={20} strokeWidth={2} />
              </IconButton>
            </Box>
          )}
          {isLoading ? (
            <Skeleton variant="text" width={220} />
          ) : (
            <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
              {group?.description || "No description provided."}
            </Typography>
          )}
        </Box>
      </Box>

      {!isLoading && members.length > 0 && (
        <AvatarGroup
          max={3}
          onClick={onShowMembers}
          sx={{
            cursor: "pointer",
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              fontSize: "0.8rem",
              border: "2px solid var(--color-surface)",
            },
          }}
        >
          {members.map((member) => (
            <MemberAvatar key={member.id} backendUrl={backendUrl} token={accessToken} member={member} size={32} />
          ))}
        </AvatarGroup>
      )}
    </Box>
  );
}
