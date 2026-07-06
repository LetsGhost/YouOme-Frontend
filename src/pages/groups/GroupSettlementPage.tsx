import { useNavigate, useParams } from "react-router-dom";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Calendar, Check, ChevronRight, Clock3 } from "lucide-react";
import { Alert, Box, Button, Chip, IconButton, Typography } from "@mui/material";

import { useAppState } from "../../app/AppStateContext";
import type { SettlementExpenseDetail } from "../../shared/api/backend";
import { formatMoney, formatShortDate } from "../../shared/lib/format";
import { LoadingBlock } from "../../shared/ui/InlineSpinner";
import { getStatusChipSx, getStatusLabel } from "../../widgets/module/group/groupDebtWidgetHelpers";
import { useGroupSettlementData } from "./useGroupSettlementData";
import { useSettlementScheduleData } from "./useSettlementScheduleData";

const AVATAR_COLORS = ["#5c6bb0", "#a35a41", "#3f7d8c", "#7a5aa3"];
const colorFor = (index: number) => AVATAR_COLORS[index % AVATAR_COLORS.length];

const sectionTitleSx = {
  fontWeight: 700,
  fontSize: "0.95rem",
  color: "var(--color-ink)",
};

function ExpenseBreakdown({ expenses }: { expenses?: SettlementExpenseDetail[] }) {
  if (!expenses || expenses.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
        mt: 1,
        pt: 1,
        borderTop: "1px solid var(--color-border)",
      }}
    >
      {expenses.map((expense) => (
        <Box key={expense.expenseId} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption" sx={{ color: "var(--color-muted)", flex: 1, minWidth: 0 }} noWrap>
            {expense.title}
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--color-ink)", flexShrink: 0 }}
          >
            {formatMoney(expense.shareAmount)}
          </Typography>
          <Chip
            size="small"
            label={getStatusLabel(expense.participantStatus)}
            sx={{ ...getStatusChipSx(expense.participantStatus), height: 18, fontSize: "0.65rem", flexShrink: 0 }}
          />
        </Box>
      ))}
    </Box>
  );
}

const microLabelSx = {
  fontFamily: "var(--font-mono)",
  fontSize: 9.5,
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  color: "var(--color-muted)",
};

export function GroupSettlementPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { groups } = useAppState();

  const group = groups.find((candidate) => candidate.id === id);
  const { schedule } = useSettlementScheduleData(id, true);
  const {
    outgoing,
    incoming,
    waiting,
    balances,
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
  } = useGroupSettlementData(id);

  const maxAbsBalance = Math.max(1, ...balances.map((balance) => Math.abs(balance.net)));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <IconButton onClick={() => navigate(`/groups/${id}`)} title="Back to group">
          <ArrowLeft size={17} strokeWidth={2} color="var(--color-ink)" />
        </IconButton>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--color-ink)" }}>Settlement</Typography>
          <Typography variant="caption" sx={{ color: "var(--color-muted)" }}>
            {group?.name ?? "Group"}
          </Typography>
        </Box>
      </Box>

      <Box
        onClick={() => navigate(`/groups/${id}/settlement-schedule`)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          bgcolor: "var(--color-surface-2)",
          padding: "10px 14px",
          cursor: "pointer",
          "&:hover": { borderColor: "var(--color-border-strong)" },
        }}
      >
        <Calendar size={15} strokeWidth={1.8} color="var(--color-accent-soft-ink)" style={{ flexShrink: 0 }} />
        <Typography sx={{ flex: 1, fontWeight: 600, fontSize: "0.8rem", color: "var(--color-ink)" }}>
          {schedule?.isActive && schedule.nextRunAt
            ? `Repeats ${schedule.frequency} · next on ${formatShortDate(schedule.nextRunAt)}`
            : "No active settlement schedule"}
        </Typography>
        <ChevronRight size={14} strokeWidth={2} color="var(--color-muted)" style={{ flexShrink: 0 }} />
      </Box>

      {error && <Alert severity="warning">{error}</Alert>}

      {isLoading ? (
        <LoadingBlock label="Loading settlement…" />
      ) : (
        <>
          <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: "1fr 1fr" }}>
            <Box
              sx={{
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                bgcolor: "var(--color-surface-2)",
                padding: "13px 14px",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
                <ArrowDownLeft size={13} strokeWidth={2.6} color="var(--color-warning)" />
                <Typography sx={microLabelSx}>You'll pay</Typography>
              </Box>
              <Typography sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.2rem", color: "var(--color-warning)" }}>
                {formatMoney(youOwe)}
              </Typography>
            </Box>
            <Box
              sx={{
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                bgcolor: "var(--color-surface-2)",
                padding: "13px 14px",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
                <ArrowUpRight size={13} strokeWidth={2.6} color="var(--color-success)" />
                <Typography sx={microLabelSx}>You'll receive</Typography>
              </Box>
              <Typography sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.2rem", color: "var(--color-success)" }}>
                {formatMoney(owedToYou)}
              </Typography>
            </Box>
          </Box>

          {balances.length > 0 && (
            <Box>
              <Typography sx={sectionTitleSx}>Balances</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75, mt: 1.5 }}>
                {balances.map((balance) => {
                  const isOwed = balance.net >= 0;
                  const pct = Math.min(100, (Math.abs(balance.net) / maxAbsBalance) * 100);
                  const color = isOwed ? "var(--color-success)" : "var(--color-warning)";

                  return (
                    <Box key={balance.id}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--color-ink)" }}>
                          {balance.name}
                        </Typography>
                        <Typography sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.8rem", color }}>
                          {isOwed ? "+" : "−"}
                          {formatMoney(Math.abs(balance.net))}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", height: 8 }}>
                        <Box sx={{ flex: 1, height: "100%", display: "flex", justifyContent: "flex-end", overflow: "hidden", borderRadius: "4px 0 0 0" }}>
                          <Box
                            sx={{
                              width: isOwed ? 0 : `${pct}%`,
                              height: "100%",
                              bgcolor: "var(--color-warning)",
                              borderRadius: "4px 0 0 4px",
                            }}
                          />
                        </Box>
                        <Box sx={{ width: "1.5px", height: 14, bgcolor: "var(--color-border-strong)", flexShrink: 0 }} />
                        <Box sx={{ flex: 1, height: "100%", overflow: "hidden" }}>
                          <Box
                            sx={{
                              width: isOwed ? `${pct}%` : 0,
                              height: "100%",
                              bgcolor: "var(--color-success)",
                              borderRadius: "0 4px 4px 0",
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {outgoing.length > 0 && (
            <Box>
              <Typography sx={sectionTitleSx}>You owe</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1.25 }}>
                {outgoing.map((row, index) => (
                  <Box
                    key={row._id}
                    sx={{
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      padding: "10px 13px",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          bgcolor: colorFor(index),
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          flexShrink: 0,
                        }}
                      >
                        {row.counterpartName.charAt(0)}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--color-ink)" }}>
                          {row.counterpartName}
                        </Typography>
                        <Typography sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.82rem", color: "var(--color-warning)" }}>
                          {formatMoney(row.amount)}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        disabled={busyId === row._id}
                        startIcon={<Check size={13} strokeWidth={2.6} />}
                        onClick={() => void handleMarkPaid(row._id)}
                        sx={{
                          bgcolor: "var(--color-accent)",
                          color: "var(--color-accent-contrast)",
                          fontWeight: 700,
                          fontSize: "0.72rem",
                          textTransform: "none",
                          flexShrink: 0,
                          "&:hover": { bgcolor: "var(--color-accent)", opacity: 0.9 },
                        }}
                      >
                        I paid
                      </Button>
                    </Box>
                    <ExpenseBreakdown expenses={row.expenses} />
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {incoming.length > 0 && (
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography sx={sectionTitleSx}>Awaiting your approval</Typography>
                <Button
                  size="small"
                  disabled={isBulkBusy}
                  startIcon={<Check size={12} strokeWidth={2.6} />}
                  onClick={() => void handleApproveAll()}
                  sx={{
                    border: "1px solid var(--color-success-border)",
                    color: "var(--color-success)",
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    textTransform: "none",
                  }}
                >
                  Approve all
                </Button>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1.25 }}>
                {incoming.map((row, index) => (
                  <Box
                    key={row._id}
                    sx={{
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      padding: "10px 13px",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          bgcolor: colorFor(index + 2),
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          flexShrink: 0,
                        }}
                      >
                        {row.counterpartName.charAt(0)}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--color-ink)" }}>
                          {row.counterpartName} says paid
                        </Typography>
                        <Typography sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.82rem", color: "var(--color-success)" }}>
                          {formatMoney(row.amount)}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        disabled={busyId === row._id}
                        onClick={() => void handleApprove(row._id)}
                        sx={{
                          bgcolor: "var(--color-accent)",
                          color: "var(--color-accent-contrast)",
                          borderRadius: "8px",
                          flexShrink: 0,
                          "&:hover": { bgcolor: "var(--color-accent)", opacity: 0.9 },
                        }}
                      >
                        <Check size={13} strokeWidth={2.6} />
                      </IconButton>
                    </Box>
                    <ExpenseBreakdown expenses={row.expenses} />
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {waiting.length > 0 && (
            <Box>
              <Typography sx={sectionTitleSx}>Waiting</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1.25 }}>
                {waiting.map((row, index) => (
                  <Box
                    key={row._id}
                    sx={{
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      padding: "10px 13px",
                      opacity: 0.85,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          bgcolor: colorFor(index + 1),
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          flexShrink: 0,
                        }}
                      >
                        {row.counterpartName.charAt(0)}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--color-ink)" }}>
                          {row.counterpartName}
                        </Typography>
                        <Typography sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.82rem", color: "var(--color-muted)" }}>
                          {formatMoney(row.amount)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0, color: "var(--color-muted)" }}>
                        <Clock3 size={13} strokeWidth={2} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {row.waitingOn === "their-approval" ? "Waiting for approval" : "Waiting for payment"}
                        </Typography>
                      </Box>
                    </Box>
                    <ExpenseBreakdown expenses={row.expenses} />
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {outgoing.length === 0 && incoming.length === 0 && waiting.length === 0 && (
            <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
              Nothing to settle in this group right now.
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}
