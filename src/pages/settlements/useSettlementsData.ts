import { useCallback, useEffect, useState } from "react";

import { useAppState } from "../../app/AppStateContext";
import {
  approveAllSettlements,
  approveSettlement,
  getSettlementsForGroup,
  listGroupMembers,
  markAllSettlementsPaid,
  markSettlementPaid,
  type GroupMember,
  type Settlement,
} from "../../shared/api/backend";

export type SettlementRow = Settlement & {
  groupId: string;
  groupName: string;
  direction: "outgoing" | "incoming";
  counterpartName: string;
};

export function useSettlementsData() {
  const { backendUrl, session, groups } = useAppState();
  const [rows, setRows] = useState<SettlementRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isBulkBusy, setIsBulkBusy] = useState(false);

  const load = useCallback(async () => {
    if (!session?.accessToken || groups.length === 0) {
      setRows([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const perGroup = await Promise.all(
        groups.map(async (group) => {
          const [settlements, members] = await Promise.all([
            getSettlementsForGroup(backendUrl, group.id, session.accessToken),
            listGroupMembers(backendUrl, group.id, session.accessToken),
          ]);

          const memberName = (userId: string) =>
            members.find((member: GroupMember) => member.id === userId)?.name ?? "Someone";

          const outgoing: SettlementRow[] = settlements.outgoing.map((settlement) => ({
            ...settlement,
            groupId: group.id,
            groupName: group.name,
            direction: "outgoing" as const,
            counterpartName: memberName(settlement.toUserId),
          }));

          const incoming: SettlementRow[] = settlements.incoming.map((settlement) => ({
            ...settlement,
            groupId: group.id,
            groupName: group.name,
            direction: "incoming" as const,
            counterpartName: memberName(settlement.fromUserId),
          }));

          return [...outgoing, ...incoming];
        })
      );

      setRows(perGroup.flat());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settlements.");
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl, groups, session?.accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleMarkPaid = async (settlementId: string) => {
    if (!session?.accessToken) return;
    setBusyId(settlementId);
    try {
      await markSettlementPaid(backendUrl, settlementId, session.accessToken);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark settlement as paid.");
    } finally {
      setBusyId(null);
    }
  };

  const handleApprove = async (settlementId: string) => {
    if (!session?.accessToken) return;
    setBusyId(settlementId);
    try {
      await approveSettlement(backendUrl, settlementId, session.accessToken);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve settlement.");
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkAllPaid = async () => {
    if (!session?.accessToken) return;
    const groupIds = Array.from(new Set(rows.filter((row) => row.direction === "outgoing").map((row) => row.groupId)));

    setIsBulkBusy(true);
    try {
      await Promise.all(groupIds.map((groupId) => markAllSettlementsPaid(backendUrl, groupId, session.accessToken)));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark all as paid.");
    } finally {
      setIsBulkBusy(false);
    }
  };

  const handleApproveAll = async () => {
    if (!session?.accessToken) return;
    const groupIds = Array.from(new Set(rows.filter((row) => row.direction === "incoming").map((row) => row.groupId)));

    setIsBulkBusy(true);
    try {
      await Promise.all(groupIds.map((groupId) => approveAllSettlements(backendUrl, groupId, session.accessToken)));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve all.");
    } finally {
      setIsBulkBusy(false);
    }
  };

  return {
    rows,
    isLoading,
    error,
    busyId,
    isBulkBusy,
    handleMarkPaid,
    handleApprove,
    handleMarkAllPaid,
    handleApproveAll,
  };
}
