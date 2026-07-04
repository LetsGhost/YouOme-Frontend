import type { GroupDebtExpense, GroupDebtParticipant } from "../../../shared/api/backend";

export const noop = async () => {
  void 0;
};

export const microLabelSx = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  color: "var(--color-muted)",
  display: "block",
};

export const monoStatSx = {
  fontFamily: "var(--font-mono)",
  fontWeight: 700,
  fontSize: "1.35rem",
  color: "var(--color-ink)",
};

export const roundIconButtonSx = {
  width: 36,
  height: 36,
  borderRadius: "var(--radius-sm)",
  color: "var(--color-muted)",
  "&:hover": { bgcolor: "var(--color-surface-3)", color: "var(--color-ink)" },
};

export const quickActionButtonSx = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  flexShrink: 0,
};

export const fullWidthChipSx = {
  width: "100%",
  justifyContent: "center",
  "& .MuiChip-label": { width: "100%", textAlign: "center" as const },
};

export const youTagSx = {
  display: "inline-flex",
  alignItems: "center",
  flexShrink: 0,
  padding: "2px 8px",
  borderRadius: "6px",
  fontSize: "11px",
  fontWeight: 600,
  lineHeight: 1.4,
  bgcolor: "var(--color-accent-soft-bg)",
  color: "var(--color-accent-soft-ink)",
};

export function getStatusLabel(status: GroupDebtParticipant["status"]) {
  if (status === "payment-submitted") {
    return "Awaiting review";
  }

  if (status === "payment-confirmed") {
    return "Paid";
  }

  return "Pending";
}

export function getStatusTone(status: GroupDebtParticipant["status"]) {
  if (status === "payment-confirmed") {
    return "success";
  }

  if (status === "payment-submitted") {
    return "warning";
  }

  return "default";
}

export function getStatusChipSx(status: GroupDebtParticipant["status"]) {
  const tone = getStatusTone(status);

  if (tone === "success") {
    return { bgcolor: "var(--color-success-soft-bg)", color: "var(--color-success)", border: "1px solid var(--color-success-border)" };
  }

  if (tone === "warning") {
    return { bgcolor: "var(--color-warning-soft-bg)", color: "var(--color-warning)", border: "1px solid var(--color-warning-border)" };
  }

  return { bgcolor: "transparent", color: "var(--color-muted)", border: "1px solid var(--color-border)" };
}

// The board endpoint only ever returns open (non-settled) expenses, so
// expense.status is always the same generic "not fully settled" value here —
// it carries no info about individual participant progress. Derive the
// user-facing chip from the participants instead, so it reflects reality.
export function summarizeExpenseProgress(expense: GroupDebtExpense) {
  const total = expense.participants.length;
  const confirmed = expense.participants.filter((participant) => participant.status === "payment-confirmed").length;
  const submitted = expense.participants.filter((participant) => participant.status === "payment-submitted").length;

  if (expense.status === "settled" || (total > 0 && confirmed === total)) {
    return { label: "Settled", tone: "success" as const };
  }

  if (confirmed > 0) {
    return { label: `${confirmed}/${total} confirmed`, tone: "success" as const };
  }

  if (submitted > 0) {
    return { label: "Awaiting review", tone: "warning" as const };
  }

  return { label: "Awaiting payment", tone: "neutral" as const };
}

export function getExpenseStatusChipSx(tone: "success" | "warning" | "neutral") {
  if (tone === "success") {
    return { bgcolor: "var(--color-success-soft-bg)", color: "var(--color-success)", border: "1px solid var(--color-success-border)" };
  }

  if (tone === "warning") {
    return { bgcolor: "var(--color-warning-soft-bg)", color: "var(--color-warning)", border: "1px solid var(--color-warning-border)" };
  }

  return { bgcolor: "var(--color-accent-soft-bg)", color: "var(--color-accent-soft-ink)", border: "1px solid var(--color-border)" };
}

export function getSubmitKey(expenseId: string, participantUserId: string) {
  return `${expenseId}:${participantUserId}:submit`;
}

export function getApproveKey(expenseId: string, participantUserId: string) {
  return `${expenseId}:${participantUserId}:approve`;
}

export function getRejectKey(expenseId: string, participantUserId: string) {
  return `${expenseId}:${participantUserId}:reject`;
}

export function hasReviewAction(expense: GroupDebtExpense, participant: GroupDebtParticipant, currentUserId?: string) {
  return Boolean(currentUserId && expense.createdByUserId === currentUserId && participant.status === "payment-submitted");
}

export function canModifyExpense(expense: GroupDebtExpense, currentUserId?: string) {
  const isCreator = Boolean(currentUserId && expense.createdByUserId === currentUserId);
  const hasSubmission = expense.participants.some((participant) => participant.status !== "pending");
  return isCreator && !hasSubmission;
}
