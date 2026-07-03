import { useEffect, useMemo, useState } from "react";
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
import { getGroupDebtBoard, type GroupDebtBoard } from "../../shared/api/backend";
import { formatCount, formatMoney } from "../../shared/lib/format";
import { ChangelogDialog } from "../../widgets/changelog/ChangelogDialog";

export function HomePage() {
  const { backendUrl, currentUser, groups, session } = useAppState();
  const [debtBoards, setDebtBoards] = useState<GroupDebtBoard[]>([]);

  useEffect(() => {
    if (groups.length === 0) {
      setDebtBoards([]);
      return;
    }

    let isMounted = true;

    const loadDebtBoards = async () => {
      const boards = await Promise.all(
        groups.map((group) =>
          getGroupDebtBoard(backendUrl, group.id, session?.accessToken).catch(() => null)
        )
      );

      if (isMounted) {
        setDebtBoards(boards.filter((board): board is GroupDebtBoard => board !== null));
      }
    };

    void loadDebtBoards();

    return () => {
      isMounted = false;
    };
  }, [backendUrl, groups, session?.accessToken]);

  const globalDebtStats = useMemo(() => {
    const currentUserId = currentUser?.id;
    let youOwe = 0;
    let owedToYou = 0;
    let pendingPayments = 0;

    for (const board of debtBoards) {
      for (const expense of board.expenses) {
        for (const participant of expense.participants) {
          if (participant.status === "payment-confirmed") {
            continue;
          }

          if (participant.userId === currentUserId) {
            youOwe += participant.shareAmount;
            pendingPayments += 1;
          } else if (expense.paidByUserId === currentUserId) {
            owedToYou += participant.shareAmount;
            pendingPayments += 1;
          }
        }
      }
    }

    return { youOwe, owedToYou, pendingPayments };
  }, [debtBoards, currentUser?.id]);

  const dashboardStats = useMemo(() => {
    const uniqueMembers = new Map<string, string>();
    const recentActivities: Array<{ user: string; action: string; group: string; time: string }> = [];

    for (const group of groups) {
      const memberList = group.members ?? [];

      for (const member of memberList) {
        if (member.email === currentUser?.email || member.id === currentUser?.id) {
          continue;
        }

        uniqueMembers.set(member.id, member.name);
      }

      const expenses = group.expenses ?? [];

      for (const expense of expenses.slice(0, 2)) {
        recentActivities.push({
          user: typeof expense.paidBy === "object" && expense.paidBy ? expense.paidBy.name || "Someone" : String(expense.paidBy || "Someone"),
          action: "added expense in",
          group: group.name,
          time: expense.createdAt || expense.date || "Recently",
        });
      }
    }

    if (recentActivities.length === 0) {
      for (const group of groups.slice(0, 3)) {
        recentActivities.push({
          user: group.name?.[0] || "G",
          action: "group loaded from",
          group: group.name,
          time: group.updatedAt || group.createdAt || "Recently",
        });
      }
    }

    return {
      groupsCount: groups.length,
      membersCount: uniqueMembers.size,
      recentActivities,
    };
  }, [currentUser?.email, currentUser?.id, groups]);

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
      <ChangelogDialog />

      {/* Header */}
      <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
        <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1, fontSize: { xs: "1.9rem", md: "2.2rem" } }}>
          Welcome back, {currentUser?.name || "Friend"}
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
            value={formatMoney(globalDebtStats.youOwe)}
            bgColor="#eef2ff"
          />
        </Box>
        <Box>
          <StatCard
            icon={<FavoriteBorderIcon sx={{ fontSize: 32, color: "#22c55e" }} />}
            label="Owed to you"
            value={formatMoney(globalDebtStats.owedToYou)}
            bgColor="#f0fdf4"
          />
        </Box>
        <Box>
          <StatCard
            icon={<WarningIcon sx={{ fontSize: 32, color: "#f59e0b" }} />}
            label="Pending"
            value={`${formatCount(globalDebtStats.pendingPayments)} payments`}
            bgColor="#fffbeb"
          />
        </Box>
        <Box>
          <StatCard
            icon={<PeopleIcon sx={{ fontSize: 32, color: "#3b82f6" }} />}
            label="Groups"
            value={`${formatCount(dashboardStats.groupsCount)} active`}
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
            {dashboardStats.recentActivities.map((activity, idx) => (
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
                <Avatar sx={{ bgcolor: "#4f46e5", color: "white", fontWeight: "bold", flexShrink: 0 }}>
                  {activity.user?.[0] || "?"}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">
                    <strong>{activity.user}</strong> {activity.action}{" "}
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