import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, ArrowDownLeft, Clock, Users, Activity, Receipt, ChevronRight } from "lucide-react";
import { Box, Typography, Link as MuiLink } from "@mui/material";
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
    const recentActivities: Array<{ user: string; action: string; group: string; time: string; kind: "expense" | "group" }> = [];

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
          kind: "expense",
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
          kind: "group",
        });
      }
    }

    return {
      groupsCount: groups.length,
      membersCount: uniqueMembers.size,
      recentActivities,
    };
  }, [currentUser?.email, currentUser?.id, groups]);

  const balanceTotal = globalDebtStats.youOwe + globalDebtStats.owedToYou;
  const youOwePct = balanceTotal > 0 ? (globalDebtStats.youOwe / balanceTotal) * 100 : 0;
  const owedPct = balanceTotal > 0 ? 100 - youOwePct : 0;
  const net = globalDebtStats.owedToYou - globalDebtStats.youOwe;
  const netSign = net >= 0 ? "+" : "-";

  const microLabelSx = {
    fontFamily: "var(--font-mono)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontSize: "10.5px",
    color: "var(--color-muted)",
  } as const;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1080px",
        mx: "auto",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        bgcolor: "var(--color-surface)",
        boxShadow: "var(--shadow-md)",
        overflow: "hidden",
      }}
    >
      <ChangelogDialog />

      {/* Header */}
      <Box
        sx={{
          px: { xs: 2.5, md: 3.5 },
          py: { xs: 2.75, md: 3.25 },
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography sx={{ ...microLabelSx, mb: 0.5 }}>Welcome back</Typography>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: "1.4rem", md: "1.6rem" }, color: "var(--color-ink)" }}>
            {currentUser?.name || "Friend"}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            flexShrink: 0,
            borderRadius: "var(--radius-sm)",
            display: "grid",
            placeItems: "center",
            bgcolor: "var(--color-accent-soft-bg)",
            color: "var(--color-accent-soft-ink)",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: "1.1rem",
          }}
        >
          {(currentUser?.name || "F")[0].toUpperCase()}
        </Box>
      </Box>

      <Box sx={{ px: { xs: 2.5, md: 3.5 }, py: { xs: 2.5, md: 3 }, display: "flex", flexDirection: "column", gap: { xs: 2.5, md: 3 } }}>
        {/* Balance summary card */}
        <Box
          sx={{
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            bgcolor: "var(--color-surface-2)",
            p: { xs: 2, md: 2.5 },
          }}
        >
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <Box sx={{ pr: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
                <ArrowUpRight size={16} strokeWidth={2.2} color="var(--color-warning)" />
                <Typography sx={{ ...microLabelSx, color: "var(--color-warning)" }}>You owe</Typography>
              </Box>
              <Typography
                sx={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  fontSize: { xs: "1.3rem", md: "1.5rem" },
                  color: "var(--color-ink)",
                }}
              >
                {formatMoney(globalDebtStats.youOwe)}
              </Typography>
            </Box>
            <Box sx={{ pl: 2, borderLeft: "1px solid var(--color-border)" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
                <ArrowDownLeft size={16} strokeWidth={2.2} color="var(--color-success)" />
                <Typography sx={{ ...microLabelSx, color: "var(--color-success)" }}>Owed to you</Typography>
              </Box>
              <Typography
                sx={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  fontSize: { xs: "1.3rem", md: "1.5rem" },
                  color: "var(--color-ink)",
                }}
              >
                {formatMoney(globalDebtStats.owedToYou)}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              height: 6,
              borderRadius: "var(--radius-pill)",
              overflow: "hidden",
              bgcolor: "var(--color-surface-3)",
              mt: 2.25,
            }}
          >
            {balanceTotal > 0 ? (
              <>
                <Box sx={{ width: `${youOwePct}%`, bgcolor: "var(--color-warning)" }} />
                <Box sx={{ width: `${owedPct}%`, bgcolor: "var(--color-success)" }} />
              </>
            ) : null}
          </Box>

          <Typography sx={{ ...microLabelSx, mt: 1.25 }}>
            Net {netSign}
            {formatMoney(Math.abs(net))}
          </Typography>
        </Box>

        {/* Mini stat grid */}
        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          }}
        >
          <Box
            sx={{
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border)",
              p: { xs: 1.5, md: 2 },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
              <Clock size={16} strokeWidth={2} color="var(--color-warning)" />
              <Typography sx={microLabelSx}>Pending</Typography>
            </Box>
            <Typography sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.15rem", color: "var(--color-ink)" }}>
              {formatCount(globalDebtStats.pendingPayments)}
            </Typography>
          </Box>
          <Box
            sx={{
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border)",
              p: { xs: 1.5, md: 2 },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
              <Users size={16} strokeWidth={2} color="var(--color-accent)" />
              <Typography sx={microLabelSx}>Groups</Typography>
            </Box>
            <Typography sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.15rem", color: "var(--color-ink)" }}>
              {formatCount(dashboardStats.groupsCount)}
            </Typography>
          </Box>
        </Box>

        {/* Recent activity */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Activity size={18} strokeWidth={2} color="var(--color-ink)" />
            <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--color-ink)" }}>Recent activity</Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {dashboardStats.recentActivities.map((activity, idx) => {
              const Icon = activity.kind === "expense" ? Receipt : Users;
              return (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    alignItems: "flex-start",
                    py: 1.5,
                    borderTop: idx === 0 ? "none" : "1px solid var(--color-border)",
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      flexShrink: 0,
                      borderRadius: "var(--radius-sm)",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "var(--color-accent-soft-bg)",
                      color: "var(--color-accent-soft-ink)",
                    }}
                  >
                    <Icon size={16} strokeWidth={2} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ color: "var(--color-ink-soft)" }}>
                      <Box component="strong" sx={{ color: "var(--color-ink)" }}>
                        {activity.user}
                      </Box>{" "}
                      {activity.action} {activity.group}
                    </Typography>
                    <Typography sx={{ ...microLabelSx, mt: 0.5 }}>{activity.time}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

          <MuiLink
            component={Link}
            to="/notifications"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              mt: 2,
              color: "var(--color-accent-strong-ink)",
              fontWeight: 700,
              fontSize: "0.875rem",
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            View all notifications
            <ChevronRight size={16} strokeWidth={2.2} />
          </MuiLink>
        </Box>
      </Box>
    </Box>
  );
}
