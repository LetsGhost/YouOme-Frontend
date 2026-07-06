import { useEffect, useState } from "react";

import { useAppState } from "../../app/AppStateContext";
import { getSettlementHistory, getSettlementRunDetail, type SettlementRun } from "../../shared/api/backend";

export function useActiveSettlementRun(groupId: string | undefined) {
  const { backendUrl, session } = useAppState();
  const [activeRun, setActiveRun] = useState<SettlementRun | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!groupId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const load = async () => {
      setIsLoading(true);

      try {
        const runs = await getSettlementHistory(backendUrl, groupId, session?.accessToken);
        const openRuns = runs
          .filter((run) => run.status === "open")
          .sort((a, b) => new Date(a.graceDeadlineAt).getTime() - new Date(b.graceDeadlineAt).getTime());

        const soonest = openRuns[0] ?? null;
        if (!isMounted) return;

        setActiveRun(soonest);

        if (soonest) {
          const detail = await getSettlementRunDetail(backendUrl, groupId, soonest._id, session?.accessToken);
          if (isMounted) {
            setPendingCount(detail.settlements.filter((settlement) => settlement.status === "pending").length);
          }
        } else {
          setPendingCount(0);
        }
      } catch {
        if (isMounted) {
          setActiveRun(null);
          setPendingCount(0);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [backendUrl, groupId, session?.accessToken]);

  return { activeRun, pendingCount, isLoading };
}
