import { Search, Users } from "lucide-react";
import { Box, Card, CardContent, Divider, InputAdornment, TextField, Typography } from "@mui/material";

import type { FriendSummary } from "../../shared/api/backend";
import { LoadingBlock } from "../../shared/ui/InlineSpinner";
import { FriendCard } from "./FriendCard";
import { microLabelSx, outlinedFieldSx } from "./friendsStyles";

export function FriendsListCard({
  friends,
  totalCount,
  isLoading,
  searchTerm,
  onSearchTermChange,
  backendUrl,
  accessToken,
}: {
  friends: FriendSummary[];
  totalCount: number;
  isLoading: boolean;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  backendUrl: string;
  accessToken?: string;
}) {
  return (
    <Card>
      <CardContent sx={{ display: "grid", gap: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Users size={18} color="var(--color-ink)" strokeWidth={2} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "var(--color-ink)" }}>
                Your friends
              </Typography>
              <Typography sx={microLabelSx}>{totalCount} connected</Typography>
            </Box>
          </Box>

          <TextField
            size="small"
            placeholder="Search friends"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} color="var(--color-muted)" strokeWidth={1.8} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: { xs: 0, sm: 240 }, ...outlinedFieldSx }}
          />
        </Box>

        <Divider sx={{ borderColor: "var(--color-border)" }} />

        {isLoading ? (
          <LoadingBlock label="Loading friends…" />
        ) : friends.length > 0 ? (
          <Box sx={{ display: "grid", gap: 2 }}>
            {friends.map((friend) => (
              <FriendCard key={friend.id} friend={friend} backendUrl={backendUrl} accessToken={accessToken} />
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Users size={56} strokeWidth={1.6} color="var(--color-muted-3)" style={{ marginBottom: 12 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: "var(--color-ink)" }}>
              No friends yet
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
              Send a request by email and accepted users will appear here.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
