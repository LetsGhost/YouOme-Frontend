import { Bell, ChevronRight, Settings } from "lucide-react";
import { Box, Typography } from "@mui/material";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ProfileLinkRow({
  icon: Icon,
  label,
  onClick,
  showDivider,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  showDivider: boolean;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        all: "unset",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        width: "100%",
        py: 2,
        cursor: "pointer",
        borderBottom: showDivider ? "1px solid var(--color-border)" : "none",
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "var(--radius-sm)",
          bgcolor: "var(--color-surface-3)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={16} strokeWidth={1.8} color="var(--color-ink)" />
      </Box>
      <Typography sx={{ flex: 1, fontWeight: 500, fontSize: "13.5px", color: "var(--color-ink)", textAlign: "left" }}>
        {label}
      </Typography>
      <ChevronRight size={15} strokeWidth={2} color="var(--color-muted)" />
    </Box>
  );
}

export function ProfileLinksCard() {
  const navigate = useNavigate();

  return (
    <Box>
      <ProfileLinkRow icon={Settings} label="Settings" onClick={() => navigate("/settings")} showDivider />
      <ProfileLinkRow
        icon={Bell}
        label="Notification preferences"
        onClick={() => navigate("/notifications")}
        showDivider={false}
      />
    </Box>
  );
}
