import { useMemo, useState } from "react";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ChatIcon from "@mui/icons-material/Chat";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Avatar,
  IconButton,
  Chip,
  InputAdornment,
} from "@mui/material";

import { useAppState } from "../../app/AppStateContext";

export function FriendsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { currentUser, groups } = useAppState();

  const friends = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        email: string;
        mutualGroups: number;
        lastGroup: string;
      }
    >();

    for (const group of groups) {
      for (const member of group.members ?? []) {
        if (member.id === currentUser?.id || member.email === currentUser?.email) {
          continue;
        }

        const existing = map.get(member.id);

        if (existing) {
          existing.mutualGroups += 1;
          continue;
        }

        map.set(member.id, {
          id: member.id,
          name: member.name,
          email: member.email || "No email provided",
          mutualGroups: 1,
          lastGroup: group.name,
        });
      }
    }

    return Array.from(map.values());
  }, [currentUser?.email, currentUser?.id, groups]);

  const filteredFriends = friends.filter((friend) =>
    `${friend.name} ${friend.email} ${friend.lastGroup}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 0.5 }}>
          Friends
        </Typography>
        <Typography variant="h6" sx={{ color: "text.secondary" }}>
          View your friends and shared expenses
        </Typography>
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Search friends..."
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

      {/* Friends List */}
      {filteredFriends.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filteredFriends.map((friend) => (
            <Card key={friend.id} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center", flex: 1 }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                      }}
                    >
                      {friend.name[0]}
                    </Avatar>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                        {friend.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {friend.email}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={`${friend.mutualGroups} shared group${friend.mutualGroups !== 1 ? "s" : ""}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: "0.75rem" }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                        Shared groups
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#22c55e" }}>
                        {friend.mutualGroups}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                        Latest in {friend.lastGroup}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <IconButton
                        size="small"
                        sx={{
                          color: "#4f46e5",
                          "&:hover": { bgcolor: "#eef2ff" },
                        }}
                      >
                        <ChatIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{
                          color: "#4f46e5",
                          "&:hover": { bgcolor: "#eef2ff" },
                        }}
                      >
                        <PersonAddIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <PeopleIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
            No friends found
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            Your friends from shared groups will appear here
          </Typography>
        </Box>
      )}
    </Box>
  );
}
