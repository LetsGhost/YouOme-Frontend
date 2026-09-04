import { useNavigate, useParams } from "react-router-dom";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Calendar, Check, ChevronRight, Clock3 } from "lucide-react";
import { Alert, Box, Button, Chip, IconButton, Typography } from "@mui/material";

import { useAppState } from "../../app/AppStateContext";
import type { SettlementExpenseDetail } from "../../shared/api/backend";
import { formatMoney, formatShortDate } from "../../shared/lib/format";
import { LoadingBlock } from "../../shared/ui/InlineSpinner";
import { getStatusChipSx, getStatusLabel } from "../../widgets/module/group/groupDebtWidgetHelpers";
import { useGroupSettlementData, type PersonSettlementGroup } from "./useGroupSettlementData";
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

const amountRowSx = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  border: "1px solid var(--color-border)",
  borderRadius: "9px",
  padding: "8px 10px",
};

function PersonSettlementCard({
  person,
  index,
  busyId,
  onMarkPaid,
  onApprove,
}: {
  person: PersonSettlementGroup;
  index: number;
  busyId: string | null;
  onMarkPaid: (settlementId: string) => void;
  onApprove: (settlementId: string) => void;
}) {
  const allExpenses = [...person.payItems, ...person.receiveItems, ...person.waitingItems].flatMap(
    (item) => item.expenses ?? []
  );

  return (
    <Box
      sx={{
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "12px 14px",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1 }}>
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
          {person.name.charAt(0)}
        </Box>
        <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-ink)" }}>
          {person.name}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        {person.payItems.length === 1 ? (
          <Box sx={amountRowSx}>
            <ArrowDownLeft size={13} strokeWidth={2.6} color="var(--color-warning)" style={{ flexShrink: 0 }} />
            <Typography sx={{ flex: 1, fontSize: "0.78rem", fontWeight: 500, color: "var(--color-ink)" }}>
              You pay
            </Typography>
            <Typography
              sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.82rem", color: "var(--color-warning)" }}
            >
              {formatMoney(person.youPay)}
            </Typography>
            <Button
              size="small"
              disabled={busyId === person.payItems[0]._id}
              startIcon={<Check size={13} strokeWidth={2.6} />}
              onClick={() => onMarkPaid(person.payItems[0]._id)}
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
        ) : (
          person.payItems.length > 1 &&
          person.payItems.map((row) => (
            <Box key={row._id} sx={amountRowSx}>
              <ArrowDownLeft size={13} strokeWidth={2.6} color="var(--color-warning)" style={{ flexShrink: 0 }} />
              <Typography sx={{ flex: 1, fontSize: "0.78rem", fontWeight: 500, color: "var(--color-ink)" }}>
                You pay
              </Typography>
              <Typography
                sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.82rem", color: "var(--color-warning)" }}
              >
                {formatMoney(row.amount)}
              </Typography>
              <Button
                size="small"
                disabled={busyId === row._id}
                startIcon={<Check size={13} strokeWidth={2.6} />}
                onClick={() => onMarkPaid(row._id)}
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
          ))
        )}

        {person.receiveItems.length === 1 ? (
          <Box sx={amountRowSx}>
            <ArrowUpRight size={13} strokeWidth={2.6} color="var(--color-success)" style={{ flexShrink: 0 }} />
            <Typography sx={{ flex: 1, fontSize: "0.78rem", fontWeight: 500, color: "var(--color-ink)" }}>
              You receive
            </Typography>
            <Typography
              sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.82rem", color: "var(--color-success)" }}
            >
              {formatMoney(person.youReceive)}
            </Typography>
            <IconButton
              size="small"
              disabled={busyId === person.receiveItems[0]._id}
              onClick={() => onApprove(person.receiveItems[0]._id)}
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
        ) : (
          person.receiveItems.length > 1 &&
          person.receiveItems.map((row) => (
            <Box key={row._id} sx={amountRowSx}>
              <ArrowUpRight size={13} strokeWidth={2.6} color="var(--color-success)" style={{ flexShrink: 0 }} />
              <Typography sx={{ flex: 1, fontSize: "0.78rem", fontWeight: 500, color: "var(--color-ink)" }}>
                You receive
              </Typography>
              <Typography
                sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.82rem", color: "var(--color-success)" }}
              >
                {formatMoney(row.amount)}
              </Typography>
              <IconButton
                size="small"
                disabled={busyId === row._id}
                onClick={() => onApprove(row._id)}
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
          ))
        )}

        {person.waitingItems.map((row) => (
          <Box key={row._id} sx={{ ...amountRowSx, opacity: 0.85 }}>
            <Clock3 size={13} strokeWidth={2} color="var(--color-muted)" style={{ flexShrink: 0 }} />
            <Typography sx={{ flex: 1, fontSize: "0.78rem", fontWeight: 500, color: "var(--color-ink)" }}>
              {row.waitingOn === "their-approval" ? "Waiting for approval" : "Waiting for payment"}
            </Typography>
            <Typography
              sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.82rem", color: "var(--color-muted)" }}
            >
              {formatMoney(row.amount)}
            </Typography>
          </Box>
        ))}
      </Box>

      <ExpenseBreakdown expenses={allExpenses} />
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
  } = useGroupSettlementData(id);

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

          {peopleGroups.length > 0 && (
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography sx={sectionTitleSx}>By person</Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {outgoing.length > 0 && (
                    <Button
                      size="small"
                      disabled={isBulkBusy}
                      startIcon={<Check size={12} strokeWidth={2.6} />}
                      onClick={() => void handleMarkAllPaid()}
                      sx={{
                        border: "1px solid var(--color-warning)",
                        color: "var(--color-warning)",
                        fontWeight: 700,
                        fontSize: "0.72rem",
                        textTransform: "none",
                      }}
                    >
                      Mark all paid
                    </Button>
                  )}
                  {incoming.length > 0 && (
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
                  )}
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, mt: 1.25 }}>
                {peopleGroups.map((person, index) => (
                  <PersonSettlementCard
                    key={person.id}
                    person={person}
                    index={index}
                    busyId={busyId}
                    onMarkPaid={(settlementId) => void handleMarkPaid(settlementId)}
                    onApprove={(settlementId) => void handleApprove(settlementId)}
                  />
                ))}
              </Box>
            </Box>
          )}

          {peopleGroups.length === 0 && (
            <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
              Nothing to settle in this group right now.
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}
