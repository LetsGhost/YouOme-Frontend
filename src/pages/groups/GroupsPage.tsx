import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
import PeopleIcon from "@mui/icons-material/People";
import {
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
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
import { createGroup } from "../../shared/api/backend";
import { formatCount, formatMoney } from "../../shared/lib/format";

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
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 0.5 }}>
            Groups
          </Typography>
          <Typography variant="h6" sx={{ color: "text.secondary" }}>
            Manage and view all your shared groups
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateModal(true)}
          sx={{
            bgcolor: "#4f46e5",
            color: "white",
            p: 1.5,
            fontWeight: "bold",
            "&:hover": {
              bgcolor: "#4338ca",
            },
          }}
        >
          New Group
        </Button>
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Search groups..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 1,
          },
        }}
      />

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      {/* Groups Grid */}
      {isLoading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Skeleton variant="rounded" height={260} />
            </Grid>
          ))}
        </Grid>
      ) : filteredGroups.length > 0 ? (
        <Grid container spacing={3}>
          {filteredGroups.map((group) => (
            <Grid item xs={12} md={6} lg={4} key={getGroupId(group)}>
              <Card
                onClick={() => navigate(`/groups/${getGroupId(group)}`)}
                sx={{
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: 3,
                    transform: "translateY(-2px)",
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
                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", flex: 1 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1,
                          background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "1.25rem",
                          flexShrink: 0,
                        }}
                      >
                        {group.name[0]}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis" }}
                        >
                          {group.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis" }}
                        >
                          {group.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <IconButton size="small" sx={{ color: "text.secondary" }}>
                        <SettingsIcon />
                      </IconButton>
                      <IconButton size="small" sx={{ color: "error.main" }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Stats */}
                  <Box sx={{ py: 2, borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" }}>
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                          Members
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          {formatCount(group.memberCount ?? group.members?.length ?? 0)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                          Total
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          {formatMoney(group.totalExpense)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                          Your Share
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#4f46e5" }}>
                          {formatMoney(group.yourShare)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Actions */}
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<PersonAddIcon />}
                    sx={{
                      mt: 2,
                      bgcolor: "#eef2ff",
                      color: "#4f46e5",
                      fontWeight: "bold",
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: "#dbeafe",
                      },
                    }}
                  >
                    Invite members
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <PeopleIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
            No groups found
          </Typography>
          <Typography sx={{ color: "text.secondary", mb: 2 }}>
            Create your first group to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateModal(true)}
            sx={{
              bgcolor: "#4f46e5",
              color: "white",
              "&:hover": {
                bgcolor: "#4338ca",
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
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
          Create New Group
        </DialogTitle>
        <Divider />
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
        <Divider />
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setShowCreateModal(false)}
            variant="outlined"
            sx={{ textTransform: "none", fontWeight: "bold" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateGroup}
            variant="contained"
            disabled={isSubmitting}
            sx={{
              bgcolor: "#4f46e5",
              color: "white",
              textTransform: "none",
              fontWeight: "bold",
              "&:hover": {
                bgcolor: "#4338ca",
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