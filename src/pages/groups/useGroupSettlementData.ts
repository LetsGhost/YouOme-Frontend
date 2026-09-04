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

export type GroupSettlementRow = Settlement & {
  counterpartId: string;
  counterpartName: string;
};

export type WaitingSettlementRow = GroupSettlementRow & {
  waitingOn: "their-approval" | "their-payment";
};

export type PersonSettlementGroup = {
  id: string;
  name: string;
  youPay: number;
  youReceive: number;
  payItems: GroupSettlementRow[];
  receiveItems: GroupSettlementRow[];
  waitingItems: WaitingSettlementRow[];
};

export function useGroupSettlementData(groupId: string | undefined) {
  const { backendUrl, session, currentUser } = useAppState();
  const [outgoing, setOutgoing] = useState<GroupSettlementRow[]>([]);
  const [incoming, setIncoming] = useState<GroupSettlementRow[]>([]);
  const [waiting, setWaiting] = useState<WaitingSettlementRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isBulkBusy, setIsBulkBusy] = useState(false);

  const load = useCallback(async () => {
    if (!groupId || !session?.accessToken) {
      setOutgoing([]);
      setIncoming([]);
      setWaiting([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [settlements, members] = await Promise.all([
        getSettlementsForGroup(backendUrl, groupId, session.accessToken),
        listGroupMembers(backendUrl, groupId, session.accessToken),
      ]);

      const memberName = (userId: string) =>
        members.find((member: GroupMember) => member.id === userId)?.name ?? "Someone";

      setOutgoing(
        settlements.outgoing.map((settlement) => ({
          ...settlement,
          counterpartId: settlement.toUserId,
          counterpartName: memberName(settlement.toUserId),
        }))
      );
      setIncoming(
        settlements.incoming.map((settlement) => ({
          ...settlement,
          counterpartId: settlement.fromUserId,
          counterpartName: memberName(settlement.fromUserId),
        }))
      );
      setWaiting(
        settlements.waiting.map((settlement) => {
          const isDebtor = settlement.fromUserId === currentUser?.id;
          const counterpartId = isDebtor ? settlement.toUserId : settlement.fromUserId;
          return {
            ...settlement,
            counterpartId,
            counterpartName: memberName(counterpartId),
            waitingOn: isDebtor ? "their-approval" : "their-payment",
          };
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settlements.");
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl, groupId, session?.accessToken, currentUser?.id]);

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
    if (!groupId || !session?.accessToken) return;
    setIsBulkBusy(true);
    try {
      await markAllSettlementsPaid(backendUrl, groupId, session.accessToken);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark all as paid.");
    } finally {
      setIsBulkBusy(false);
    }
  };

  const handleApproveAll = async () => {
    if (!groupId || !session?.accessToken) return;
    setIsBulkBusy(true);
    try {
      await approveAllSettlements(backendUrl, groupId, session.accessToken);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve all.");
    } finally {
      setIsBulkBusy(false);
    }
  };

  const youOwe = outgoing.reduce((sum, row) => sum + row.amount, 0);
  const owedToYou = incoming.reduce((sum, row) => sum + row.amount, 0);

  const peopleGroups: PersonSettlementGroup[] = (() => {
    const byId = new Map<string, PersonSettlementGroup>();
    const groupFor = (id: string, name: string) => {
      let group = byId.get(id);
      if (!group) {
        group = { id, name, youPay: 0, youReceive: 0, payItems: [], receiveItems: [], waitingItems: [] };
        byId.set(id, group);
      }
      return group;
    };

    for (const row of outgoing) {
      const group = groupFor(row.counterpartId, row.counterpartName);
      group.youPay += row.amount;
      group.payItems.push(row);
    }
    for (const row of incoming) {
      const group = groupFor(row.counterpartId, row.counterpartName);
      group.youReceive += row.amount;
      group.receiveItems.push(row);
    }
    for (const row of waiting) {
      const group = groupFor(row.counterpartId, row.counterpartName);
      group.waitingItems.push(row);
    }

    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
  })();

  return {
    outgoing,
    incoming,
    waiting,
    peopleGroups,
    youOwe,
    owedToYou,
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
