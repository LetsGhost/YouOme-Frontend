import { useState } from "react";
import { Alert, Box } from "@mui/material";

import { FriendsHeader } from "./FriendsHeader";
import { FriendsListCard } from "./FriendsListCard";
import { PendingInvitesCard } from "./PendingInvitesCard";
import { SendFriendRequestCard } from "./SendFriendRequestCard";
import { useFriendsData } from "./useFriendsData";

export function FriendsPage() {
  const {
    backendUrl,
    accessToken,
    friends,
    pendingInvites,
    isLoading,
    isSubmitting,
    errorMessage,
    handleSendInvite,
    handleInviteResponse,
  } = useFriendsData();

  const [searchTerm, setSearchTerm] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  const filteredFriends = friends.filter((friend) =>
    `${friend.name} ${friend.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInvites = pendingInvites.filter((invite) =>
    `${invite.fromUserName} ${invite.fromUserEmail}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSendInvite = async () => {
    const succeeded = await handleSendInvite(inviteEmail);
    if (succeeded) {
      setInviteEmail("");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <FriendsHeader />

      {errorMessage && (
        <Alert
          severity="warning"
          sx={{
            borderRadius: "var(--radius-md)",
            bgcolor: "var(--color-warning-soft-bg)",
            color: "var(--color-warning)",
            border: "1px solid var(--color-warning-border)",
            "& .MuiAlert-icon": { color: "var(--color-warning)" },
          }}
        >
          {errorMessage}
        </Alert>
      )}

      <SendFriendRequestCard
        inviteEmail={inviteEmail}
        onInviteEmailChange={setInviteEmail}
        isSubmitting={isSubmitting}
        onSendInvite={() => void onSendInvite()}
      />

      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: "1.2fr 0.8fr" } }}>
        <FriendsListCard
          friends={filteredFriends}
          totalCount={friends.length}
          isLoading={isLoading}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          backendUrl={backendUrl}
          accessToken={accessToken}
        />

        <PendingInvitesCard
          invites={filteredInvites}
          isSubmitting={isSubmitting}
          backendUrl={backendUrl}
          accessToken={accessToken}
          onRespond={(notificationId, inviteId, accept) => void handleInviteResponse(notificationId, inviteId, accept)}
        />
      </Box>
    </Box>
  );
}
