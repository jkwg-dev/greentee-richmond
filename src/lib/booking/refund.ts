/**
 * The vendor-owned refund brackets (booking.md §4, §14.3), keyed off the
 * reservation start time. They are recorded here as constants pending open
 * question Q3 (whether the policy endpoint exposes them); when Q3 resolves the
 * one change is to source these from the policy, and every bracket line and the
 * standing policy sentence re-derive from this single table.
 *
 * The percent a cancellation would earn is advisory preview copy only: §14.3
 * computes it from the start time against the current clock to set expectations
 * in the confirm dialog, but the authoritative refund figures are always the
 * cancel response's `refundPercent` and `refundAmountCents`, never this preview.
 */

type RefundBracket = {
  /** Cancel at least this many hours before start to earn `percent`. */
  minHoursBefore: number;
  percent: number;
};

/** Ordered most-generous first, so the first satisfied bracket wins. */
export const REFUND_BRACKETS: readonly RefundBracket[] = [
  { minHoursBefore: 24, percent: 100 },
  { minHoursBefore: 12, percent: 50 },
  { minHoursBefore: 0, percent: 0 },
];

const FULL = REFUND_BRACKETS[0];
const HALF = REFUND_BRACKETS[1];

/**
 * The advisory bracket percent for a start time against the current clock
 * (§14.3). `startsAt` is parsed to an instant for the hours-before comparison;
 * nothing is recomputed for display and the string itself is never mutated.
 * `nowMs` is passed in so the function stays pure and testable.
 */
export function refundBracketPercent(startsAt: string, nowMs: number): number {
  const hoursBefore = (Date.parse(startsAt) - nowMs) / 3_600_000;
  for (const bracket of REFUND_BRACKETS) {
    if (hoursBefore >= bracket.minHoursBefore) return bracket.percent;
  }
  return 0;
}

/** The confirm-dialog bracket line for a paid reservation (§14.3). */
export function refundPreviewLine(percent: number): string {
  if (percent >= FULL.percent) return "Cancelling now qualifies for a full refund.";
  if (percent > 0) return `Cancelling now qualifies for a ${percent} percent refund.`;
  return "This reservation is no longer refundable.";
}

/** A pending reservation with no captured payment (§14.3). */
export const REFUND_UNPAID_LINE =
  "This reservation has not been paid, so no refund applies.";

/** The standing policy sentence, built from the brackets so numbers live once (§14.3). */
export const REFUND_POLICY_LINE = `Cancel up to ${FULL.minHoursBefore} hours before your start time for a full refund, ${HALF.percent} percent from ${HALF.minHoursBefore} to ${FULL.minHoursBefore} hours before, and no refund within ${HALF.minHoursBefore} hours of the start time.`;
