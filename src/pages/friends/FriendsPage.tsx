import { useState } from "react";
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

export function FriendsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - will be replaced with real API data
  const friends = [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      mutualGroups: 2,
      totalOwed: "€ 45.50",
    },
    {
      id: "2",
      name: "John Smith",
      email: "john@example.com",
      mutualGroups: 1,
      totalOwed: "-€ 30.00",
    },
    {
      id: "3",
      name: "Emma Davis",
      email: "emma@example.com",
      mutualGroups: 3,
      totalOwed: "€ 12.75",
    },
  ];

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                        Balance
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          color: friend.totalOwed.startsWith("-") ? "#ef4444" : "#22c55e",
                        }}
                      >
                        {friend.totalOwed}
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
