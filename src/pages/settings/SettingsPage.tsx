import { useState } from "react";
import { Box, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useAppState } from "../../app/AppStateContext";
import {
  changePassword,
  deleteUserAvatar,
  updateProfile,
  uploadUserAvatar,
} from "../../shared/api/backend";
import { AccountInfoCard } from "./AccountInfoCard";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { DangerZoneCard } from "./DangerZoneCard";
import { SettingsHeader } from "./SettingsHeader";
import { TermsAndSafetyCard } from "./TermsAndSafetyCard";

export function SettingsPage() {
  const navigate = useNavigate();
  const { currentUser, backendUrl, session, deleteCurrentUser, updateCurrentUser, setNotice } = useAppState();
  const [isDeleting, setIsDeleting] = useState(false);

  const [name, setName] = useState(currentUser?.name ?? "");
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const isProfileDirty = name !== (currentUser?.name ?? "") || email !== (currentUser?.email ?? "");

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const updated = await updateProfile(backendUrl, { name, email }, session?.accessToken);
      updateCurrentUser(updated);
      setNotice({ tone: "success", message: "Profile updated." });
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Failed to update profile." });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleOpenPasswordDialog = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(null);
    setIsPasswordDialogOpen(true);
  };

  const handleClosePasswordDialog = () => {
    if (isChangingPassword) return;
    setIsPasswordDialogOpen(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setPasswordError(null);
    setIsChangingPassword(true);

    try {
      await changePassword(backendUrl, { currentPassword, newPassword }, session?.accessToken);
      setNotice({ tone: "success", message: "Password changed." });
      setIsPasswordDialogOpen(false);
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Failed to change password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

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

  const handleDeleteAccount = async () => {
    if (!confirm("This will permanently delete your account. Continue?")) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteCurrentUser();
      navigate("/login", { replace: true });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete account.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <SettingsHeader />

        <AccountInfoCard
          currentUser={currentUser}
          backendUrl={backendUrl}
          accessToken={session?.accessToken}
          name={name}
          onNameChange={setName}
          email={email}
          onEmailChange={setEmail}
          isProfileDirty={isProfileDirty}
          isSavingProfile={isSavingProfile}
          onSaveProfile={() => void handleSaveProfile()}
          onOpenPasswordDialog={handleOpenPasswordDialog}
          onUploadAvatar={handleUploadAvatar}
          onRemoveAvatar={handleRemoveAvatar}
        />

        <TermsAndSafetyCard />

        <DangerZoneCard isDeleting={isDeleting} onDeleteAccount={() => void handleDeleteAccount()} />
      </Box>

      <ChangePasswordDialog
        open={isPasswordDialogOpen}
        onClose={handleClosePasswordDialog}
        currentPassword={currentPassword}
        onCurrentPasswordChange={setCurrentPassword}
        newPassword={newPassword}
        onNewPasswordChange={setNewPassword}
        confirmPassword={confirmPassword}
        onConfirmPasswordChange={setConfirmPassword}
        passwordError={passwordError}
        isChangingPassword={isChangingPassword}
        onSubmit={() => void handleChangePassword()}
      />
    </Container>
  );
}
