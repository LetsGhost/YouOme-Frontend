import { useState } from "react";
import { Box, Container } from "@mui/material";

import { useAppState } from "../../app/AppStateContext";
import { deleteUserAvatar, updateProfile, uploadUserAvatar } from "../../shared/api/backend";
import { EditBioDialog } from "./EditBioDialog";
import { ProfileHeaderCard } from "./ProfileHeaderCard";
import { ProfileLinksCard } from "./ProfileLinksCard";
import { ProfileStatsRow } from "./ProfileStatsRow";
import { useProfileStats } from "./useProfileStats";

export function ProfilePage() {
  const { currentUser, backendUrl, session, updateCurrentUser, setNotice } = useAppState();
  const { isLoading, totalSettled, currentlyOpen, friendsCount } = useProfileStats();

  const [isBioDialogOpen, setIsBioDialogOpen] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [isSavingBio, setIsSavingBio] = useState(false);

  const handleUploadAvatar = async (file: File) => {
    try {
      const updated = await uploadUserAvatar(backendUrl, file, session?.accessToken);
      updateCurrentUser(updated);
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Failed to upload avatar." });
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const updated = await deleteUserAvatar(backendUrl, session?.accessToken);
      updateCurrentUser(updated);
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Failed to remove avatar." });
    }
  };

  const handleOpenBioDialog = () => {
    setBioDraft(currentUser?.bio ?? "");
    setIsBioDialogOpen(true);
  };

  const handleCloseBioDialog = () => {
    if (isSavingBio) return;
    setIsBioDialogOpen(false);
  };

  const handleSaveBio = async () => {
    setIsSavingBio(true);
    try {
      const updated = await updateProfile(backendUrl, { bio: bioDraft.trim() }, session?.accessToken);
      updateCurrentUser(updated);
      setIsBioDialogOpen(false);
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Failed to update bio." });
    } finally {
      setIsSavingBio(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box
        sx={{
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border)",
          bgcolor: "var(--color-surface)",
          boxShadow: "var(--shadow-md)",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid var(--color-border)" }}>
          <ProfileHeaderCard
            currentUser={currentUser}
            backendUrl={backendUrl}
            accessToken={session?.accessToken}
            onUploadAvatar={handleUploadAvatar}
            onRemoveAvatar={handleRemoveAvatar}
            onEditBio={handleOpenBioDialog}
          />

          <ProfileStatsRow
            isLoading={isLoading}
            totalSettled={totalSettled}
            currentlyOpen={currentlyOpen}
            friendsCount={friendsCount}
          />
        </Box>

        <Box sx={{ px: 3 }}>
          <ProfileLinksCard />
        </Box>
      </Box>

      <EditBioDialog
        open={isBioDialogOpen}
        onClose={handleCloseBioDialog}
        bio={bioDraft}
        onBioChange={setBioDraft}
        isSaving={isSavingBio}
        onSubmit={() => void handleSaveBio()}
      />
    </Container>
  );
}
