import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import WarningIcon from "@mui/icons-material/Warning";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Link as MuiLink,
} from "@mui/material";
import { Link } from "react-router-dom";

import { useAppState } from "../../app/AppStateContext";

export function HomePage() {
  const { currentUser } = useAppState();

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1080px",
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        gap: { xs: 2.5, md: 3.5 },
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
        <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1, fontSize: { xs: "1.9rem", md: "2.2rem" } }}>
          Welcome back, {currentUser?.name || "Friend"}! 👋
        </Typography>
        <Typography variant="h6" sx={{ color: "text.secondary", fontSize: { xs: "1rem", md: "1.1rem" } }}>
          Here's what's happening with your finances
        </Typography>
      </Box>

      {/* Quick Stats Grid */}
      <Box
        sx={{
          display: "grid",
          gap: 2.2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
          },
        }}
      >
        <Box>
          <StatCard
            icon={<TrendingUpIcon sx={{ fontSize: 32, color: "#4f46e5" }} />}
            label="You owe"
            value="€ 245.50"
            bgColor="#eef2ff"
          />
        </Box>
        <Box>
          <StatCard
            icon={<FavoriteBorderIcon sx={{ fontSize: 32, color: "#22c55e" }} />}
            label="Owed to you"
            value="€ 112.75"
            bgColor="#f0fdf4"
          />
        </Box>
        <Box>
          <StatCard
            icon={<WarningIcon sx={{ fontSize: 32, color: "#f59e0b" }} />}
            label="Pending"
            value="3 payments"
            bgColor="#fffbeb"
          />
        </Box>
        <Box>
          <StatCard
            icon={<PeopleIcon sx={{ fontSize: 32, color: "#3b82f6" }} />}
            label="Groups"
            value="5 active"
            bgColor="#eff6ff"
          />
        </Box>
      </Box>

      {/* Recent Activities */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <WarningIcon sx={{ fontSize: 28, color: "#4f46e5" }} />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Recent Activities
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              {
                user: "Sarah",
                action: "added you to",
                group: "Weekend Trip",
                time: "2 hours ago",
              },
              {
                user: "John",
                action: "settled payment with",
                group: "You",
                time: "Yesterday",
              },
              {
                user: "Emma",
                action: "added expense to",
                group: "Apartment Expenses",
                time: "2 days ago",
              },
            ].map((activity, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  gap: 2,
                  p: { xs: 1.5, md: 2 },
                  borderRadius: 1,
                  bgcolor: "#eef2ff",
                  border: "1px solid #e0e7ff",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "#dbeafe",
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: "#4f46e5",
                    color: "white",
                    fontWeight: "bold",
                    flexShrink: 0,
                  }}
                >
                  {activity.user[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">
                    <strong>{activity.user}</strong> {activity.action}{" "}
                    <strong>{activity.group}</strong>
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", mt: 0.5, display: "block" }}
                  >
                    {activity.time}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          <MuiLink
            component={Link}
            to="/notifications"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              mt: 2,
              color: "#4f46e5",
              fontWeight: "bold",
              fontSize: "0.875rem",
              textDecoration: "none",
              "&:hover": {
                color: "#4338ca",
              },
            }}
          >
            View all notifications →
          </MuiLink>
        </CardContent>
      </Card>
    </Box>
  );
}

function StatCard({
  icon,
  label,
  value,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor: string;
}) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        bgcolor: bgColor,
        border: "1px solid #e5e7eb",
        height: "100%",
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ mb: 1.5 }}>{icon}</Box>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}