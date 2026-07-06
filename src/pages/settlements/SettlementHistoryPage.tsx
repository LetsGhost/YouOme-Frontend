import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { Alert, Box, IconButton, Typography } from "@mui/material";

import { formatMoney } from "../../shared/lib/format";
import { LoadingBlock } from "../../shared/ui/InlineSpinner";
import { useSettlementHistoryData, type SettlementRunRow } from "./useSettlementHistoryData";

type StatusStyle = {
  label: string;
  icon: typeof Check;
  ink: string;
  bg: string;
  border: string;
};

const STATUS_STYLE: Record<string, StatusStyle> = {
  completed: {
    label: "Completed",
    icon: Check,
    ink: "var(--color-success)",
    bg: "var(--color-success-soft-bg)",
    border: "var(--color-success-border)",
  },
  partially_completed: {
    label: "Overdue",
    icon: Clock,
    ink: "var(--color-warning)",
    bg: "var(--color-warning-soft-bg)",
    border: "var(--color-warning-border)",
  },
  open: {
    label: "Open",
    icon: Clock,
    ink: "var(--color-muted)",
    bg: "var(--color-surface-2)",
    border: "var(--color-border)",
  },
};

function formatRunDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function subtitleFor(run: SettlementRunRow) {
  const summary = run.summary;
  if (!summary || summary.totalCount === 0) return null;

  if (run.status === "completed") {
    return `${summary.participantCount} ${summary.participantCount === 1 ? "person" : "people"} · all confirmed`;
  }

  return `${summary.confirmedCount} of ${summary.totalCount} confirmed`;
}

export function SettlementHistoryPage() {
  const [searchParams] = useSearchParams();
  const groupFilter = searchParams.get("groupId");

  const { runs: allRuns, isLoading, error, expandedRunId, expandedSettlements, isDetailLoading, toggleExpand } =
    useSettlementHistoryData();

  const runs = groupFilter ? allRuns.filter((run) => run.groupId === groupFilter) : allRuns;
  const backTo = groupFilter ? `/groups/${groupFilter}` : "/settlements";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Typography
        variant="caption"
        sx={{
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--color-muted)",
        }}
      >
        Settlement history
      </Typography>

      <Box
        sx={{
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          bgcolor: "var(--color-surface)",
          overflow: "hidden",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 2.5 }}>
          <IconButton component={RouterLink} to={backTo} title="Back" size="small">
            <ArrowLeft size={18} strokeWidth={2} />
          </IconButton>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "var(--color-ink)" }}>
              Settlement history
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
              {groupFilter ? runs[0]?.groupName ?? "This group" : "Across your groups"}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ borderTop: "1px solid var(--color-border)", px: 2.5, pb: 2.5, pt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {error && <Alert severity="warning">{error}</Alert>}

          {isLoading ? (
            <LoadingBlock label="Loading history…" />
          ) : runs.length === 0 ? (
            <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
              No settlements have run yet.
            </Typography>
          ) : (
            <>
              {runs.map((run) => {
                const style = STATUS_STYLE[run.status] ?? STATUS_STYLE.open;
                const StatusIcon = style.icon;
                const isExpanded = expandedRunId === run._id;
                const subtitle = subtitleFor(run);

                return (
                  <Box
                    key={run._id}
                    sx={{
                      border: `1px solid ${style.border}`,
                      borderRadius: "var(--radius-md)",
                      bgcolor: style.bg,
                      p: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, color: "var(--color-ink)" }}>
                          {formatRunDate(run.closedAt ?? run.createdAt)}
                        </Typography>
                        {!groupFilter && (
                          <Typography variant="caption" sx={{ color: "var(--color-muted)" }}>
                            {run.groupName}
                          </Typography>
                        )}
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          px: 1.25,
                          py: 0.5,
                          borderRadius: "var(--radius-pill)",
                          border: `1px solid ${style.border}`,
                          flexShrink: 0,
                        }}
                      >
                        <StatusIcon size={12} strokeWidth={2.5} color={style.ink} />
                        <Typography
                          sx={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10.5,
                            fontWeight: 700,
                            color: style.ink,
                          }}
                        >
                          {style.label}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography
                      sx={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 800,
                        fontSize: 24,
                        color: "var(--color-ink)",
                        mt: 1,
                      }}
                    >
                      {formatMoney(run.summary?.totalAmount ?? 0)}
                    </Typography>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5 }}>
                      <Typography variant="caption" sx={{ color: "var(--color-muted)" }}>
                        {subtitle}
                      </Typography>
                      <Box
                        component="button"
                        type="button"
                        onClick={() => void toggleExpand(run)}
                        sx={{
                          bgcolor: "transparent",
                          border: "none",
                          p: 0,
                          m: 0,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 0.25,
                          fontSize: 11,
                          fontFamily: "inherit",
                          color: "var(--color-muted)",
                        }}
                      >
                        Breakdown {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </Box>
                    </Box>

                    {isExpanded && (
                      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${style.border}` }}>
                        {isDetailLoading ? (
                          <LoadingBlock label="Loading settlements…" />
                        ) : (
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            {expandedSettlements.map((settlement) => (
                              <Box key={settlement._id} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                                <Typography variant="body2" sx={{ color: "var(--color-ink)" }}>
                                  {settlement.fromName} → {settlement.toName}
                                </Typography>
                                <Typography sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--color-ink)" }}>
                                  {formatMoney(
                                    settlement.status === "completed" ? settlement.settledAmount ?? 0 : settlement.amount
                                  )}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                );
              })}

              <Typography variant="caption" sx={{ color: "var(--color-muted)", textAlign: "center", mt: 0.5 }}>
                Showing last {runs.length} settlement{runs.length === 1 ? "" : "s"}
              </Typography>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
