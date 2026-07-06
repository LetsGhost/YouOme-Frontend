import { useCallback, useEffect, useState } from "react";

import { useAppState } from "../../app/AppStateContext";
import {
  getSettlementHistory,
  getSettlementRunDetail,
  listGroupMembers,
  type Settlement,
  type SettlementRun,
} from "../../shared/api/backend";

export type SettlementRunRow = SettlementRun & { groupName: string };
export type SettlementDetailRow = Settlement & { fromName: string; toName: string };

export function useSettlementHistoryData() {
  const { backendUrl, session, groups } = useAppState();
  const [runs, setRuns] = useState<SettlementRunRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [expandedSettlements, setExpandedSettlements] = useState<SettlementDetailRow[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const load = useCallback(async () => {
    if (!session?.accessToken || groups.length === 0) {
      setRuns([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const perGroup = await Promise.all(
        groups.map(async (group) => {
          const history = await getSettlementHistory(backendUrl, group.id, session.accessToken);
          return history.map((run) => ({ ...run, groupName: group.name }));
        })
      );

      setRuns(perGroup.flat().sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settlement history.");
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl, groups, session?.accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleExpand = async (run: SettlementRunRow) => {
    if (expandedRunId === run._id) {
      setExpandedRunId(null);
      setExpandedSettlements([]);
      return;
    }

    setExpandedRunId(run._id);
    setIsDetailLoading(true);

    try {
      const [detail, members] = await Promise.all([
        getSettlementRunDetail(backendUrl, run.groupId, run._id, session?.accessToken),
        listGroupMembers(backendUrl, run.groupId, session?.accessToken),
      ]);

      const memberName = (userId: string) => members.find((member) => member.id === userId)?.name ?? "Someone";

      setExpandedSettlements(
        detail.settlements.map((settlement) => ({
          ...settlement,
          fromName: memberName(settlement.fromUserId),
          toName: memberName(settlement.toUserId),
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settlement run detail.");
    } finally {
      setIsDetailLoading(false);
    }
  };

  return {
    runs,
    isLoading,
    error,
    expandedRunId,
    expandedSettlements,
    isDetailLoading,
    toggleExpand,
  };
}
