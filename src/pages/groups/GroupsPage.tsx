import { useMemo, useState } from "react";
import { Alert, Box } from "@mui/material";

import { useAppState } from "../../app/AppStateContext";
import { createGroup } from "../../shared/api/backend";
import { CreateGroupDialog, type NewGroupForm } from "./CreateGroupDialog";
import { GroupsGrid } from "./GroupsGrid";
import { GroupsHeader } from "./GroupsHeader";
import { GroupsSearchBar } from "./GroupsSearchBar";

export function GroupsPage() {
  const { backendUrl, groups, isBootstrapping, reloadGroups, session } = useAppState();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState<NewGroupForm>({ name: "", description: "" });
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

  const handleCreateGroup = async (e: { preventDefault: () => void }) => {
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
      <GroupsHeader onNewGroup={() => setShowCreateModal(true)} />

      <GroupsSearchBar value={searchTerm} onChange={setSearchTerm} />

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <GroupsGrid
        isLoading={isLoading}
        groups={filteredGroups}
        backendUrl={backendUrl}
        accessToken={session?.accessToken}
        onCreateGroup={() => setShowCreateModal(true)}
      />

      <CreateGroupDialog
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        newGroup={newGroup}
        onChange={(patch) => setNewGroup((current) => ({ ...current, ...patch }))}
        onSubmit={handleCreateGroup}
        isSubmitting={isSubmitting}
      />
    </Box>
  );
}
