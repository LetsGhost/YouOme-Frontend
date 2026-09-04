import { useEffect, useState } from "react";

import { useAppState } from "../../app/AppStateContext";
import {
  deactivateSettlementSchedule,
  getSettlementSchedule,
  saveSettlementSchedule,
  triggerSettlement,
  type SettlementSchedule,
  type UpsertSettlementScheduleInput,
} from "../../shared/api/backend";

const DEFAULT_DRAFT: UpsertSettlementScheduleInput = {
  frequency: "weekly",
  dayOfWeek: 1,
  dayOfMonth: 1,
  anchorMonth: 1,
  time: "09:00",
  graceDays: 2,
  sendReminder: true,
  autoApproveAfterDays: 7,
  autoApproveEnabled: true,
};

export function useSettlementScheduleData(id: string | undefined, enabled: boolean) {
  const { backendUrl, session, setNotice } = useAppState();
  const [schedule, setSchedule] = useState<SettlementSchedule | null>(null);
  const [draft, setDraft] = useState<UpsertSettlementScheduleInput>(DEFAULT_DRAFT);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !enabled || !session?.accessToken) {
      return;
    }

    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const existing = await getSettlementSchedule(backendUrl, id, session.accessToken);
        if (!isMounted) return;

        setSchedule(existing);
        if (existing) {
          setDraft({
            frequency: existing.frequency,
            dayOfWeek: existing.dayOfWeek ?? 1,
            dayOfMonth: existing.dayOfMonth ?? 1,
            anchorMonth: existing.anchorMonth ?? 1,
            time: existing.time,
            graceDays: existing.graceDays,
            sendReminder: existing.sendReminder,
            autoApproveAfterDays: existing.autoApproveAfterDays,
            autoApproveEnabled: existing.autoApproveEnabled,
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load settlement schedule.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [backendUrl, id, enabled, session?.accessToken]);

  const updateDraft = (fields: Partial<UpsertSettlementScheduleInput>) => {
    setDraft((current) => ({ ...current, ...fields }));
  };

  const handleSave = async () => {
    if (!id || !session?.accessToken) return;

    setIsSaving(true);
    setError(null);

    try {
      const saved = await saveSettlementSchedule(backendUrl, id, draft, session.accessToken);
      setSchedule(saved);
      setNotice({ tone: "success", message: "Settlement schedule saved." });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settlement schedule.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!id || !session?.accessToken) return;

    setIsSaving(true);
    setError(null);

    try {
      const updated = await deactivateSettlementSchedule(backendUrl, id, session.accessToken);
      setSchedule(updated);
      setNotice({ tone: "success", message: "Scheduled settlements turned off." });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to turn off scheduled settlements.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerNow = async () => {
    if (!id || !session?.accessToken) return;

    setIsTriggering(true);
    setError(null);

    try {
      const run = await triggerSettlement(backendUrl, id, session.accessToken);
      setNotice(
        run
          ? { tone: "success", message: "Settlement triggered." }
          : { tone: "info", message: "Nothing to settle right now." }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to trigger settlement.");
    } finally {
      setIsTriggering(false);
    }
  };

  return {
    schedule,
    draft,
    isLoading,
    isSaving,
    isTriggering,
    error,
    updateDraft,
    handleSave,
    handleDeactivate,
    handleTriggerNow,
  };
}
