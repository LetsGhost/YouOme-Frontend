import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, ChevronDown, Clock3, Info, ShieldCheck, X, Zap } from "lucide-react";
import { Alert, Box, IconButton, Typography } from "@mui/material";

import { useAppState } from "../../app/AppStateContext";
import { getGroup, listGroupMembers, type Group } from "../../shared/api/backend";
import { LoadingBlock } from "../../shared/ui/InlineSpinner";
import { formatTimestamp } from "../../shared/lib/format";
import { useSettlementScheduleData } from "./useSettlementScheduleData";

const WEEKDAY_BUTTONS = [
  { label: "M", value: 1, name: "Monday" },
  { label: "T", value: 2, name: "Tuesday" },
  { label: "W", value: 3, name: "Wednesday" },
  { label: "T", value: 4, name: "Thursday" },
  { label: "F", value: 5, name: "Friday" },
  { label: "S", value: 6, name: "Saturday" },
  { label: "S", value: 0, name: "Sunday" },
];

const QUARTER_OPTIONS = [
  { label: "Q1", months: "Jan-Mar", anchorMonth: 1 },
  { label: "Q2", months: "Apr-Jun", anchorMonth: 4 },
  { label: "Q3", months: "Jul-Sep", anchorMonth: 7 },
  { label: "Q4", months: "Oct-Dec", anchorMonth: 10 },
];

const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, index) => index + 1);

const fieldLabelSx = {
  font: "500 10px 'IBM Plex Mono'",
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  color: "var(--color-muted)",
  mb: 1,
};

const freqBtnSx = (active: boolean) => ({
  flex: 1,
  textAlign: "center" as const,
  borderRadius: "9px",
  padding: "10px",
  font: "600 12px 'IBM Plex Sans'",
  cursor: "pointer",
  border: active ? "1.5px solid var(--color-accent)" : "1px solid var(--color-border)",
  background: active ? "var(--color-accent-soft-bg)" : "transparent",
  color: active ? "var(--color-accent-strong-ink)" : "var(--color-muted)",
});

const dayToggleSx = (active: boolean) => ({
  flex: 1,
  textAlign: "center" as const,
  borderRadius: "9px",
  padding: "9px 0",
  font: "600 12px 'IBM Plex Sans'",
  cursor: "pointer",
  border: active ? "1.5px solid var(--color-accent)" : "1px solid var(--color-border)",
  background: active ? "var(--color-accent-soft-bg)" : "transparent",
  color: active ? "var(--color-accent-strong-ink)" : "var(--color-muted)",
});

const dayOfMonthSx = (active: boolean) => ({
  height: 34,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  font: active ? "700 12.5px 'IBM Plex Sans'" : "500 12.5px 'IBM Plex Sans'",
  color: active ? "var(--color-accent-contrast)" : "var(--color-ink-soft)",
  background: active ? "var(--color-accent)" : "transparent",
});

const quarterBtnSx = (active: boolean) => ({
  flex: 1,
  textAlign: "center" as const,
  borderRadius: "10px",
  padding: "10px 6px",
  cursor: "pointer",
  border: active ? "1.5px solid var(--color-accent)" : "1px solid var(--color-border)",
  background: active ? "var(--color-accent-soft-bg)" : "transparent",
});

const selectBoxSx = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  border: "1px solid var(--color-border)",
  borderRadius: "9px",
  padding: "6px 12px",
};

const checkboxBoxSx = (checked: boolean) => ({
  width: 18,
  height: 18,
  borderRadius: "5px",
  border: checked ? "1.5px solid var(--color-accent)" : "1.5px solid var(--color-border-strong)",
  background: checked ? "var(--color-accent)" : "transparent",
  flex: "none",
  marginTop: "1px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
});

export function ScheduleSettlementAdminPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { backendUrl, currentUser, session } = useAppState();

  const [group, setGroup] = useState<Group | null>(null);
  const [canManage, setCanManage] = useState<boolean | null>(null);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    Promise.all([
      getGroup(backendUrl, id, session?.accessToken),
      listGroupMembers(backendUrl, id, session?.accessToken),
    ])
      .then(([groupSnapshot, members]) => {
        if (!isMounted) return;
        setGroup(groupSnapshot);
        const membership = members.find((member) => member.id === currentUser?.id);
        setCanManage(["owner", "admin", "moderator"].includes(membership?.role ?? ""));
      })
      .catch(() => {
        if (isMounted) setCanManage(false);
      });

    return () => {
      isMounted = false;
    };
  }, [backendUrl, id, session?.accessToken, currentUser?.id]);

  const {
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
  } = useSettlementScheduleData(id, canManage === true);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Typography
        sx={{
          font: "500 10px 'IBM Plex Mono'",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-muted)",
        }}
      >
        Schedule settlement · Admin
      </Typography>

      {canManage === false && <Alert severity="warning">You don't have permission to manage this group's settlement schedule.</Alert>}
      {error && <Alert severity="warning">{error}</Alert>}

      {canManage !== false && (
        <Box
          sx={{
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            bgcolor: "var(--color-surface-2)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              padding: "18px 24px",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <IconButton onClick={() => navigate(`/groups/${id}/settings`)} title="Back to settings">
              <ArrowLeft size={17} strokeWidth={2} color="var(--color-ink)" />
            </IconButton>
            <Box>
              <Typography sx={{ font: "700 18px 'IBM Plex Sans'", color: "var(--color-ink)" }}>
                Schedule settlement
              </Typography>
              <Typography sx={{ font: "400 11.5px 'IBM Plex Sans'", color: "var(--color-muted)", mt: "2px" }}>
                {group?.name ?? "Group"} · owner, admin &amp; moderator only
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                font: "500 9.5px 'IBM Plex Mono'",
                color: "var(--color-accent-strong-ink)",
                border: "1px solid var(--color-accent)",
                borderRadius: "14px",
                padding: "3px 8px",
                flex: "none",
                marginLeft: "auto",
              }}
            >
              <ShieldCheck size={11} strokeWidth={2.4} />
              Admin
            </Box>
          </Box>

          <Box sx={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 2.5 }}>
            {isLoading || canManage === null ? (
              <LoadingBlock label="Loading schedule…" />
            ) : (
              <>
                <Box>
                  <Typography sx={fieldLabelSx}>Frequency</Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {(["weekly", "monthly", "quarterly"] as const).map((frequency) => (
                      <Box
                        key={frequency}
                        component="button"
                        type="button"
                        onClick={() => updateDraft({ frequency })}
                        sx={freqBtnSx(draft.frequency === frequency)}
                      >
                        {frequency[0].toUpperCase() + frequency.slice(1)}
                      </Box>
                    ))}
                  </Box>
                </Box>

                {draft.frequency === "weekly" && (
                  <Box>
                    <Typography sx={fieldLabelSx}>Repeats on</Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {WEEKDAY_BUTTONS.map(({ label, value, name }) => (
                        <Box
                          key={name}
                          component="button"
                          type="button"
                          title={name}
                          onClick={() => updateDraft({ dayOfWeek: value })}
                          sx={dayToggleSx((draft.dayOfWeek ?? 1) === value)}
                        >
                          {label}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {draft.frequency === "monthly" && (
                  <Box>
                    <Typography sx={fieldLabelSx}>Day of month</Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        rowGap: "10px",
                        columnGap: "4px",
                      }}
                    >
                      {DAYS_OF_MONTH.map((day) => (
                        <Box
                          key={day}
                          component="button"
                          type="button"
                          onClick={() => updateDraft({ dayOfMonth: day })}
                          sx={dayOfMonthSx((draft.dayOfMonth ?? 1) === day)}
                        >
                          {day}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {draft.frequency === "quarterly" && (
                  <Box>
                    <Typography sx={fieldLabelSx}>Settle at start of</Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {QUARTER_OPTIONS.map(({ label, months, anchorMonth }) => {
                        const active = (draft.anchorMonth ?? 1) === anchorMonth;
                        return (
                          <Box
                            key={label}
                            component="button"
                            type="button"
                            onClick={() => updateDraft({ anchorMonth })}
                            sx={quarterBtnSx(active)}
                          >
                            <Typography
                              sx={{
                                font: "700 13px 'IBM Plex Sans'",
                                color: active ? "var(--color-accent-strong-ink)" : "var(--color-ink)",
                              }}
                            >
                              {label}
                            </Typography>
                            <Typography
                              sx={{
                                font: "500 10px 'IBM Plex Sans'",
                                color: active ? "var(--color-accent-strong-ink)" : "var(--color-muted)",
                                mt: "2px",
                              }}
                            >
                              {months}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}

                <Box>
                  <Typography sx={fieldLabelSx}>Time</Typography>
                  <Box sx={selectBoxSx}>
                    <Clock3 size={14} strokeWidth={1.8} color="var(--color-accent-soft-ink)" />
                    <Box
                      component="input"
                      type="time"
                      value={draft.time}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => updateDraft({ time: event.target.value })}
                      sx={{
                        flex: 1,
                        font: "500 12px 'IBM Plex Sans'",
                        color: "var(--color-ink)",
                        border: "none",
                        background: "transparent",
                        outline: "none",
                      }}
                    />
                    <ChevronDown size={14} strokeWidth={1.8} color="var(--color-muted)" />
                  </Box>
                </Box>

                <Box
                  sx={{
                    border: "1px solid var(--color-border)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    bgcolor: "var(--color-warning-soft-bg)",
                  }}
                >
                  <Info size={15} strokeWidth={1.8} color="var(--color-warning)" style={{ flexShrink: 0 }} />
                  <Typography sx={{ font: "400 11.5px 'IBM Plex Sans'", color: "var(--color-ink-soft)", lineHeight: 1.5 }}>
                    {schedule?.isActive && schedule.nextRunAt ? (
                      <>
                        Next settlement will be generated on{" "}
                        <Box component="b" sx={{ color: "var(--color-ink)", fontWeight: 500 }}>
                          {formatTimestamp(schedule.nextRunAt)}
                        </Box>{" "}
                        using open balances at that time.
                      </>
                    ) : (
                      "This group has no active settlement schedule yet."
                    )}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, cursor: "pointer" }}
                    onClick={() => updateDraft({ sendReminder: !draft.sendReminder })}
                  >
                    <Box sx={checkboxBoxSx(draft.sendReminder ?? true)}>
                      {draft.sendReminder && <Check size={12} strokeWidth={3} color="#fff" />}
                    </Box>
                    <Box>
                      <Typography sx={{ font: "600 12.5px 'IBM Plex Sans'", color: "var(--color-ink)" }}>
                        Send reminder to members
                      </Typography>
                      <Typography sx={{ font: "400 11px 'IBM Plex Sans'", color: "var(--color-muted)", mt: "4px", lineHeight: 1.5 }}>
                        Notify everyone in the group when a new settlement is generated.
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
                    <Box
                      sx={checkboxBoxSx(draft.autoApproveEnabled ?? true)}
                      onClick={() => updateDraft({ autoApproveEnabled: !draft.autoApproveEnabled })}
                    >
                      {draft.autoApproveEnabled && <Check size={12} strokeWidth={3} color="#fff" />}
                    </Box>
                    <Box>
                      <Typography sx={{ font: "600 12.5px 'IBM Plex Sans'", color: "var(--color-ink)" }}>
                        Auto-approve after{" "}
                        <Box
                          component="input"
                          type="number"
                          value={draft.autoApproveAfterDays ?? 7}
                          onClick={(event: React.MouseEvent) => event.stopPropagation()}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                            updateDraft({ autoApproveAfterDays: Number(event.target.value) })
                          }
                          min={1}
                          max={30}
                          sx={{
                            width: 34,
                            font: "600 12.5px 'IBM Plex Mono'",
                            color: "var(--color-ink)",
                            border: "none",
                            borderBottom: "1px solid var(--color-border-strong)",
                            background: "transparent",
                            outline: "none",
                            textAlign: "center",
                          }}
                        />{" "}
                        days
                      </Typography>
                      <Typography sx={{ font: "400 11px 'IBM Plex Sans'", color: "var(--color-muted)", mt: "4px", lineHeight: 1.5 }}>
                        "I paid" claims left unreviewed for {draft.autoApproveAfterDays ?? 7} day
                        {(draft.autoApproveAfterDays ?? 7) === 1 ? "" : "s"} get approved automatically.
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box
                  component="button"
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={isSaving}
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    bgcolor: "var(--color-accent)",
                    color: "var(--color-accent-contrast)",
                    border: "none",
                    borderRadius: "11px",
                    padding: "13px",
                    font: "600 13px 'IBM Plex Sans'",
                    cursor: "pointer",
                    "&:disabled": { opacity: 0.6, cursor: "default" },
                  }}
                >
                  <Check size={16} strokeWidth={2.4} />
                  {isSaving ? "Saving…" : "Save schedule"}
                </Box>

                <Box
                  component="button"
                  type="button"
                  onClick={() => void handleTriggerNow()}
                  disabled={isTriggering}
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.75,
                    bgcolor: "transparent",
                    border: "1px solid var(--color-border)",
                    borderRadius: "11px",
                    padding: "10px",
                    color: "var(--color-ink)",
                    font: "500 11.5px 'IBM Plex Sans'",
                    cursor: "pointer",
                    "&:disabled": { opacity: 0.6, cursor: "default" },
                  }}
                >
                  <Zap size={13} strokeWidth={2.2} />
                  {isTriggering ? "Triggering…" : "Trigger settlement now"}
                </Box>

                {schedule?.isActive && (
                  <Box
                    component="button"
                    type="button"
                    onClick={() => void handleDeactivate()}
                    disabled={isSaving}
                    sx={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.75,
                      bgcolor: "transparent",
                      border: "none",
                      color: "var(--color-muted)",
                      font: "500 11.5px 'IBM Plex Sans'",
                      padding: "2px",
                      cursor: "pointer",
                      "&:disabled": { opacity: 0.6, cursor: "default" },
                    }}
                  >
                    <X size={12} strokeWidth={2.2} />
                    Turn off scheduled settlements
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
