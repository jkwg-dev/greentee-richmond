import { Eyebrow } from "@/components/ui/Eyebrow";
import { formatCad } from "@/lib/booking/format";
import type { CancelReservationResult } from "@/types/booking";

/**
 * The post-cancel result surface (booking.md §14.4), rendered strictly from the
 * cancel response: the reservation is cancelled in every branch, and the refund
 * copy is chosen by `refundStatus` and the authoritative `refundAmountCents`.
 * The dialog's advisory bracket preview never reaches here. A refund is only
 * ever stated as on its way on `succeeded`; `pending`, `processing`,
 * `review_required`, and `failed` are shown as in progress or needing review,
 * never as complete.
 */

type ResultCopy = { eyebrow: string; heading: string; body?: string };

function resultCopy(result: CancelReservationResult): ResultCopy {
  const heading = "Your reservation is cancelled.";
  const positive = result.refundAmountCents > 0;
  const amount = formatCad(result.refundAmountCents);

  switch (result.refundStatus) {
    case "succeeded":
      return positive
        ? {
            eyebrow: "Refund on the way",
            heading,
            body: `A refund of ${amount} is on its way to your original payment method.`,
          }
        : { eyebrow: "Cancelled", heading };
    case "pending":
    case "processing":
      return {
        eyebrow: "Refund in progress",
        heading,
        body: "Your cancellation is received and the refund is in progress.",
      };
    case "review_required":
      return {
        eyebrow: "Refund in Review",
        heading,
        body: "Your cancellation is received and the refund is being confirmed. Please do not submit additional payments or repeated refund requests. If the status does not change for an extended period, contact guest services.",
      };
    case "failed":
      return {
        eyebrow: "Refund Issue",
        heading,
        body: "The refund could not be completed automatically. Please contact guest services.",
      };
    case "cancelled":
      // The refund itself was cancelled: a positive amount is an issue, a zero
      // amount is the plain zero-refund cancelled state (§14.4).
      return positive
        ? {
            eyebrow: "Refund Issue",
            heading,
            body: "The refund could not be completed automatically. Please contact guest services.",
          }
        : { eyebrow: "Cancelled", heading };
    case null:
    default:
      // Nothing to refund, or a zero-percent bracket.
      return { eyebrow: "Cancelled", heading };
  }
}

export function CancelResult({ result }: { result: CancelReservationResult }) {
  const copy = resultCopy(result);
  return (
    <div>
      <Eyebrow className="mb-[18px]">{copy.eyebrow}</Eyebrow>
      <h2 className="text-ivory font-serif text-[clamp(1.5rem,3vw,2rem)] leading-[1.2] font-medium">
        {copy.heading}
      </h2>
      {copy.body && (
        <p className="text-mist mt-5 text-[13px] leading-[1.75]">{copy.body}</p>
      )}
    </div>
  );
}
