import { NextResponse } from "next/server";
import { resolveIdempotencyKey } from "@/lib/booking/idempotency";
import { cancelReservation } from "@/lib/booking/reservations";
import type { ReservationCancelled } from "@/types/booking";
import { bookingErrorResponse, NO_STORE, requireSession } from "../../../guard";

/** A mutation, never cached; a session is required in every mode (booking.md §14.1). */
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

/**
 * POST /api/booking/reservations/{id}/cancel (booking.md §14.1): cancels the
 * reservation and starts the refund, relaying the user JWT and a per-operation
 * idempotency key. The response carries the updated reservation and the refund
 * figures; the refund is never rendered complete until `refundStatus` is
 * `succeeded`. A timed-out retry resends the same key and body.
 */
export async function POST(request: Request, { params }: Context) {
  const denied = await requireSession();
  if (denied) return denied;

  const { id } = await params;
  // A retry after a timeout resends the key we issued; anything else gets a new one.
  const supplied = request.headers.get("x-idempotency-key");
  const idempotencyKey = resolveIdempotencyKey("cancellation", supplied);

  try {
    const result = await cancelReservation(id, idempotencyKey);
    const payload: ReservationCancelled = { result, idempotencyKey };
    return NextResponse.json(payload, { headers: NO_STORE });
  } catch (error) {
    return bookingErrorResponse(error);
  }
}
