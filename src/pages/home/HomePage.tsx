import { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";

import { useAppState } from "../../app/AppStateContext";
import { getGroupDebtBoard, type GroupDebtBoard } from "../../shared/api/backend";
import { ChangelogDialog } from "../../widgets/changelog/ChangelogDialog";
import { BalanceSummaryCard } from "./BalanceSummaryCard";
import { HomeHeader } from "./HomeHeader";
import { HomeStatGrid } from "./HomeStatGrid";
import { RecentActivityList, type RecentActivity } from "./RecentActivityList";

export function HomePage() {
  const { backendUrl, currentUser, groups, session } = useAppState();
  const [debtBoards, setDebtBoards] = useState<GroupDebtBoard[]>([]);
  const [isLoadingBoards, setIsLoadingBoards] = useState(true);

  useEffect(() => {
    if (groups.length === 0) {
      setDebtBoards([]);
      setIsLoadingBoards(false);
      return;
    }

    let isMounted = true;
    setIsLoadingBoards(true);

    const loadDebtBoards = async () => {
      const boards = await Promise.all(
        groups.map((group) =>
          getGroupDebtBoard(backendUrl, group.id, session?.accessToken).catch(() => null)
        )
      );

      if (isMounted) {
        setDebtBoards(boards.filter((board): board is GroupDebtBoard => board !== null));
        setIsLoadingBoards(false);
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
    const recentActivities: RecentActivity[] = [];

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

      <HomeHeader
        name={currentUser?.name || "Friend"}
        avatarUrl={currentUser?.avatarUrl}
        backendUrl={backendUrl}
        accessToken={session?.accessToken}
      />

      <Box sx={{ px: { xs: 2.5, md: 3.5 }, py: { xs: 2.5, md: 3 }, display: "flex", flexDirection: "column", gap: { xs: 2.5, md: 3 } }}>
        <BalanceSummaryCard
          isLoading={isLoadingBoards}
          youOwe={globalDebtStats.youOwe}
          owedToYou={globalDebtStats.owedToYou}
        />
        <HomeStatGrid
          isLoading={isLoadingBoards}
          pendingPayments={globalDebtStats.pendingPayments}
          groupsCount={dashboardStats.groupsCount}
        />
        <RecentActivityList isLoading={isLoadingBoards} activities={dashboardStats.recentActivities} />
      </Box>
    </Box>
  );
}
