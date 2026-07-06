import { ChevronLeft, Settings, Users } from "lucide-react";
import { AvatarGroup, Box, IconButton, Link, Typography } from "@mui/material";

import { resolveAvatarUrl, type Group, type GroupMember } from "../../shared/api/backend";
import { InlineSpinner } from "../../shared/ui/InlineSpinner";
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
  onViewHistory,
}: {
  isLoading: boolean;
  group: Group | null;
  members: GroupMember[];
  backendUrl: string;
  accessToken?: string;
  onBack: () => void;
  onOpenSettings: () => void;
  onShowMembers: () => void;
  onViewHistory: () => void;
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
        {isLoading ? (
          <Box
            sx={{
              width: 56,
              height: 56,
              flexShrink: 0,
              borderRadius: "var(--radius-sm)",
              display: "grid",
              placeItems: "center",
              bgcolor: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
            }}
          >
            <InlineSpinner size={22} color="var(--color-muted)" />
          </Box>
        ) : (
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
            <Box sx={{ display: "flex", alignItems: "center", height: 42 }}>
              <InlineSpinner size={18} color="var(--color-muted)" />
            </Box>
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
            <Box sx={{ display: "flex", alignItems: "center", height: 20 }}>
              <InlineSpinner size={14} color="var(--color-muted)" />
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
              {group?.description || "No description provided."}
            </Typography>
          )}
        </Box>
      </Box>

      {!isLoading && (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "row", sm: "column" },
            alignItems: { xs: "center", sm: "flex-end" },
            justifyContent: { xs: "space-between", sm: "flex-start" },
            width: { xs: "100%", sm: "auto" },
            gap: 0.75,
          }}
        >
          {members.length > 0 && (
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

          <Link
            component="button"
            type="button"
            onClick={onViewHistory}
            underline="hover"
            sx={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-accent-strong-ink)", whiteSpace: "nowrap" }}
          >
            View settlement history →
          </Link>
        </Box>
      )}
    </Box>
  );
}
