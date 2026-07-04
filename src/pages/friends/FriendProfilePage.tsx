import { useState } from "react";
import { UserX } from "lucide-react";
import { Box, Container, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import { LoadingBlock } from "../../shared/ui/InlineSpinner";
import { FriendProfileHeaderCard } from "./FriendProfileHeaderCard";
import { FriendProfileStatsRow } from "./FriendProfileStatsRow";
import { SharedGroupsDialog } from "./SharedGroupsDialog";
import { useFriendProfileData } from "./useFriendProfileData";

export function FriendProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    backendUrl,
    accessToken,
    friend,
    isBlocked,
    isLoading,
    isRemoving,
    sharedGroups,
    owesYou,
    handleRemoveFriend,
  } = useFriendProfileData(id);

  const [isGroupsDialogOpen, setIsGroupsDialogOpen] = useState(false);

  const onRemoveFriend = async () => {
    if (!confirm(`Remove ${friend?.name || "this friend"} from your friend list?`)) {
      return;
    }

    const succeeded = await handleRemoveFriend();
    if (succeeded) {
      navigate("/friends");
    }
  };

  if (!id) {
    return null;
  }

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
          {isLoading && !friend ? (
            <LoadingBlock label="Loading profile…" minHeight={160} />
          ) : (
            <>
              <FriendProfileHeaderCard
                friend={friend}
                isBlocked={isBlocked}
                backendUrl={backendUrl}
                accessToken={accessToken}
              />

              <FriendProfileStatsRow
                isLoading={isLoading}
                owesYou={owesYou}
                sharedGroupsCount={sharedGroups.length}
                onOpenSharedGroups={() => setIsGroupsDialogOpen(true)}
              />
            </>
          )}
        </Box>

        {friend ? (
          <Box sx={{ px: 3, py: 1 }}>
            <Box
              component="button"
              type="button"
              onClick={() => void onRemoveFriend()}
              disabled={isRemoving}
              sx={{
                all: "unset",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                width: "100%",
                py: 2,
                cursor: "pointer",
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-sm)",
                  bgcolor: "var(--color-danger-soft-bg)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <UserX size={16} strokeWidth={1.8} color="var(--color-danger)" />
              </Box>
              <Typography sx={{ flex: 1, fontWeight: 500, fontSize: "13.5px", color: "var(--color-danger)", textAlign: "left" }}>
                {isRemoving ? "Removing…" : "Remove friend"}
              </Typography>
            </Box>
          </Box>
        ) : null}
      </Box>

      <SharedGroupsDialog open={isGroupsDialogOpen} onClose={() => setIsGroupsDialogOpen(false)} groups={sharedGroups} />
    </Container>
  );
}
