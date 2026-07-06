import type { GroupMember } from "../../shared/api/backend";

export const noop = async () => {
  void 0;
};

export const EXPENSES_PAGE_SIZE = 10;

export type SplitType = "equal" | "custom" | "percentage";

export type ExpenseDraft = {
  title: string;
  amount: string;
  paidBy: string;
  description: string;
  splitType: SplitType;
  participantIds: string[];
  participantShares: Record<string, string>;
  chargeSameAmount: boolean;
  includeInNextSettlement: boolean;
};

export const microLabelSx = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
};

export function getMemberLabel(member: GroupMember) {
  return member.name || member.email || member.id;
}

export function toCents(value: number) {
  return Math.round(value * 100);
}

function buildEqualShares(totalAmount: number, participantIds: string[], chargeSameAmount: boolean) {
  const totalCents = toCents(totalAmount);
  const count = participantIds.length;

  if (count === 0) {
    return new Map<string, number>();
  }

  const shares = new Map<string, number>();

  if (chargeSameAmount) {
    const equalCents = Math.round(totalCents / count);
    participantIds.forEach((participantId) => {
      shares.set(participantId, equalCents / 100);
    });
    return shares;
  }

  const baseShare = Math.floor(totalCents / count);
  let remainder = totalCents - baseShare * count;

  participantIds.forEach((participantId) => {
    const extraCent = remainder > 0 ? 1 : 0;
    shares.set(participantId, (baseShare + extraCent) / 100);
    remainder -= extraCent;
  });

  return shares;
}

export function seedParticipantShares(totalAmount: number, participantIds: string[], splitType: SplitType) {
  if (participantIds.length === 0) {
    return {};
  }

  if (splitType === "percentage") {
    const base = (100 / (participantIds.length + 1)).toFixed(2);
    return participantIds.reduce<Record<string, string>>((result, participantId) => {
      result[participantId] = base;
      return result;
    }, {});
  }

  const equalShare = (totalAmount / (participantIds.length + 1)).toFixed(2);
  return participantIds.reduce<Record<string, string>>((result, participantId) => {
    result[participantId] = equalShare;
    return result;
  }, {});
}

export function getParticipantBreakdown(
  totalAmount: number,
  splitType: SplitType,
  participantIds: string[],
  participantShares: Record<string, string>,
  paidById: string,
  chargeSameAmount: boolean = false
) {
  if (participantIds.length === 0) {
    return { error: "Add at least one participant." } as const;
  }

  if (splitType === "equal") {
    return {
      shares: buildEqualShares(totalAmount, paidById ? [paidById, ...participantIds] : participantIds, chargeSameAmount),
    } as const;
  }

  if (splitType === "percentage") {
    const totalCents = toCents(totalAmount);
    const shares = new Map<string, number>();
    let selectedCents = 0;
    let totalPercentage = 0;

    for (const participantId of participantIds) {
      const percentage = Number(participantShares[participantId] ?? 0);

      if (!Number.isFinite(percentage) || percentage < 0) {
        return { error: "Enter a valid percentage for each participant." } as const;
      }

      totalPercentage += percentage;

      const roundedCents = Math.round((totalCents * percentage) / 100);
      shares.set(participantId, roundedCents / 100);
      selectedCents += roundedCents;
    }

    if (totalPercentage > 100.01) {
      return { error: "Percentages cannot exceed 100%." } as const;
    }

    const payerCents = totalCents - selectedCents;

    if (payerCents < 0) {
      return { error: "Percentages cannot exceed the total amount." } as const;
    }

    if (paidById) {
      shares.set(paidById, payerCents / 100);
    }

    return { shares } as const;
  }

  const shares = new Map<string, number>();
  const totalCents = toCents(totalAmount);
  let selectedCents = 0;

  for (const participantId of participantIds) {
    const shareValue = Number(participantShares[participantId]);

    if (!Number.isFinite(shareValue) || shareValue < 0) {
      return { error: "Enter a valid share for each participant." } as const;
    }

    const roundedCents = toCents(shareValue);
    shares.set(participantId, roundedCents / 100);
    selectedCents += roundedCents;
  }

  const payerCents = totalCents - selectedCents;

  if (payerCents < 0) {
    return { error: "Custom shares cannot exceed the total amount." } as const;
  }

  if (paidById) {
    shares.set(paidById, payerCents / 100);
  }

  return { shares } as const;
}
