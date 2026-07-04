import { useNavigate } from "react-router-dom";
import { Settings, Users } from "lucide-react";
import { Box, Card, CardContent, IconButton, Typography } from "@mui/material";

import type { Group } from "../../shared/api/backend";
import { resolveAvatarUrl } from "../../shared/api/backend";
import { formatCount, formatMoney } from "../../shared/lib/format";
import { AvatarUploader } from "../../widgets/avatar/AvatarUploader";
import { microLabelSx, monoValueSx } from "./groupsStyles";

const noop = async () => {
  void 0;
};

function getGroupId(group: Group) {
  return group.id;
}

export function GroupCard({ group, backendUrl, accessToken }: { group: Group; backendUrl: string; accessToken?: string }) {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(`/groups/${getGroupId(group)}`)}
      sx={{
        borderRadius: "var(--radius-md)",
        bgcolor: "var(--color-surface-2)",
        border: "1px solid var(--color-border)",
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: "var(--shadow-md)",
          transform: "translateY(-2px)",
          borderColor: "var(--color-border-strong)",
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", flex: 1, minWidth: 0 }}>
            <AvatarUploader
              src={resolveAvatarUrl(backendUrl, group.avatarUrl)}
              token={accessToken}
              fallback={<Users size={20} strokeWidth={2} />}
              size={44}
              shape="rounded"
              onUpload={noop}
              onRemove={noop}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: "var(--color-ink)", overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {group.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "var(--color-muted)", overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {group.description}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
            <IconButton
              size="small"
              sx={{ color: "var(--color-muted)", "&:hover": { color: "var(--color-ink)" } }}
              onClick={(event) => {
                event.stopPropagation();
                navigate(`/groups/${getGroupId(group)}/settings`);
              }}
            >
              <Settings size={18} strokeWidth={2} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ pt: 2, borderTop: "1px solid var(--color-border)" }}>
          <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                <Users size={12} strokeWidth={2} color="var(--color-muted)" />
                <Typography sx={{ ...microLabelSx }}>Members</Typography>
              </Box>
              <Typography sx={{ ...monoValueSx, fontSize: "1.05rem", color: "var(--color-ink)" }}>
                {formatCount(group.memberCount ?? group.members?.length ?? 0)}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ ...microLabelSx, mb: 0.5 }}>Total</Typography>
              <Typography sx={{ ...monoValueSx, fontSize: "1.05rem", color: "var(--color-ink)" }}>
                {formatMoney(group.totalExpense)}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ ...microLabelSx, mb: 0.5 }}>Your Share</Typography>
              <Typography
                sx={{
                  ...monoValueSx,
                  fontSize: "1.05rem",
                  color: Number(group.yourShare ?? 0) > 0 ? "var(--color-warning)" : "var(--color-ink)",
                }}
              >
                {formatMoney(group.yourShare)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
