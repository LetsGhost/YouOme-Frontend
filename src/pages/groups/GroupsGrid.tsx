import { Plus, Users } from "lucide-react";
import { Box, Button, Typography } from "@mui/material";

import type { Group } from "../../shared/api/backend";
import { LoadingBlock } from "../../shared/ui/InlineSpinner";
import { GroupCard } from "./GroupCard";

const gridSx = { display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" } };

export function GroupsGrid({
  isLoading,
  groups,
  backendUrl,
  accessToken,
  onCreateGroup,
}: {
  isLoading: boolean;
  groups: Group[];
  backendUrl: string;
  accessToken?: string;
  onCreateGroup: () => void;
}) {
  if (isLoading) {
    return <LoadingBlock label="Loading groups…" minHeight={260} />;
  }

  if (groups.length > 0) {
    return (
      <Box sx={gridSx}>
        {groups.map((group) => (
          <Box key={group.id}>
            <GroupCard group={group} backendUrl={backendUrl} accessToken={accessToken} />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ textAlign: "center", py: 4 }}>
      <Users size={64} strokeWidth={1.8} color="var(--color-muted-3)" style={{ marginBottom: 16 }} />
      <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--color-ink)", mb: 1 }}>
        No groups found
      </Typography>
      <Typography sx={{ color: "var(--color-muted)", mb: 2 }}>
        Create your first group to get started
      </Typography>
      <Button
        startIcon={<Plus size={18} strokeWidth={2} />}
        onClick={onCreateGroup}
        sx={{
          bgcolor: "var(--color-accent)",
          color: "var(--color-accent-contrast)",
          borderRadius: "var(--radius-pill)",
          px: 2.5,
          "&:hover": {
            bgcolor: "var(--color-accent)",
            filter: "brightness(0.92)",
          },
        }}
      >
        Create Group
      </Button>
    </Box>
  );
}
