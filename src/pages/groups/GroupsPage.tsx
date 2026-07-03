import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Settings, Search, Users } from "lucide-react";
import {
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Divider,
  Alert,
  Skeleton,
} from "@mui/material";

import { useAppState } from "../../app/AppStateContext";
import { createGroup, resolveAvatarUrl } from "../../shared/api/backend";
import { formatCount, formatMoney } from "../../shared/lib/format";
import { AvatarUploader } from "../../widgets/avatar/AvatarUploader";

const noop = async () => {
  void 0;
};

const microLabelSx = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  color: "var(--color-muted)",
};

const monoValueSx = {
  fontFamily: "var(--font-mono)",
  fontWeight: 700,
};

export function GroupsPage() {
  const navigate = useNavigate();
  const { backendUrl, groups, isBootstrapping, reloadGroups, session } = useAppState();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredGroups = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return groups;
    }

    return groups.filter((group) => {
      const searchableText = `${group.name} ${group.description || ""}`.toLowerCase();
      return searchableText.includes(term);
    });
  }, [groups, searchTerm]);

  const getGroupId = (group: (typeof groups)[number]) => group.id;

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = newGroup.name.trim();

    if (!name) {
      setErrorMessage("Group name is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await createGroup(
        backendUrl,
        {
          name,
          description: newGroup.description.trim() || undefined,
        },
        session?.accessToken
      );

      await reloadGroups();
      setShowCreateModal(false);
      setNewGroup({ name: "", description: "" });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to create group.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isBootstrapping && groups.length === 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { sm: "center" },
          gap: 2,
          pb: 2,
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "var(--color-ink)", mb: 0.5 }}>
            Groups
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
            Manage and view all your shared groups
          </Typography>
        </Box>
        <Button
          startIcon={<Plus size={18} strokeWidth={2} />}
          onClick={() => setShowCreateModal(true)}
          sx={{
            bgcolor: "var(--color-accent)",
            color: "var(--color-accent-contrast)",
            borderRadius: "var(--radius-pill)",
            px: 2.5,
            fontWeight: 700,
            "&:hover": {
              bgcolor: "var(--color-accent)",
              filter: "brightness(0.92)",
            },
          }}
        >
          New Group
        </Button>
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Search groups…"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} strokeWidth={2} color="var(--color-muted)" />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "var(--radius-sm)",
            bgcolor: "var(--color-surface-2)",
            "& fieldset": {
              borderColor: "var(--color-border)",
            },
          },
        }}
      />

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      {/* Groups Grid */}
      {isLoading ? (
        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" } }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Box key={index}>
              <Skeleton variant="rounded" height={260} />
            </Box>
          ))}
        </Box>
      ) : filteredGroups.length > 0 ? (
        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" } }}>
          {filteredGroups.map((group) => (
            <Box key={getGroupId(group)}>
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
                  {/* Header */}
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
                        token={session?.accessToken}
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

                  {/* Stats */}
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
            </Box>
          ))}
        </Box>
      ) : (
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
            onClick={() => setShowCreateModal(true)}
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
      )}

      {/* Create Group Modal */}
      <Dialog
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.5rem", color: "var(--color-ink)" }}>
          Create New Group
        </DialogTitle>
        <Divider sx={{ borderColor: "var(--color-border)" }} />
        <DialogContent sx={{ pt: 2 }}>
          <Box component="form" onSubmit={handleCreateGroup} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Group name"
              value={newGroup.name}
              onChange={(e) => setNewGroup((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Weekend Trip"
              required
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Description (optional)"
              value={newGroup.description}
              onChange={(e) => setNewGroup((p) => ({ ...p, description: e.target.value }))}
              placeholder="What is this group about?"
              multiline
              rows={3}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <Divider sx={{ borderColor: "var(--color-border)" }} />
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setShowCreateModal(false)}
            variant="outlined"
            sx={{ textTransform: "none", fontWeight: 700, borderColor: "var(--color-border)", color: "var(--color-ink)" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateGroup}
            disabled={isSubmitting}
            sx={{
              bgcolor: "var(--color-accent)",
              color: "var(--color-accent-contrast)",
              textTransform: "none",
              fontWeight: 700,
              "&:hover": {
                bgcolor: "var(--color-accent)",
                filter: "brightness(0.92)",
              },
            }}
          >
            {isSubmitting ? "Creating..." : "Create Group"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
