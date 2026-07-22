import { NextResponse } from "next/server";
import { resolveIdempotencyKey } from "@/lib/booking/idempotency";
import {
  createCheckoutSession,
  getCheckoutState,
} from "@/lib/booking/reservations";
import type { CheckoutSessionCreated } from "@/types/booking";
import { bookingErrorResponse, NO_STORE, requireSession } from "../../../guard";

/** Payment state is never cached; a session is required in every mode (booking.md §12.2). */
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

/**
 * POST /api/booking/reservations/{id}/checkout (booking.md §12.2): opens the
 * Hosted Checkout session and answers with the handoff the browser needs. The
 * ticket is a public, short-lived value, not proof of payment; it is never
 * logged, here or upstream.
 */
export async function POST(request: Request, { params }: Context) {
  const denied = await requireSession();
  if (denied) return denied;

  const { id } = await params;
  // A retry after a timeout resends the key we issued; anything else gets a new one.
  const supplied = request.headers.get("x-idempotency-key");
  const idempotencyKey = resolveIdempotencyKey("checkout-session", supplied);

  try {
    const session = await createCheckoutSession(id, idempotencyKey);
    const payload: CheckoutSessionCreated = { session, idempotencyKey };
    return NextResponse.json(payload, { headers: NO_STORE });
  } catch (error) {
    return bookingErrorResponse(error);
  }
}

/**
 * GET /api/booking/reservations/{id}/checkout (booking.md §12.2): the payment
 * status poll. A read, so it carries no idempotency key.
 */
export async function GET(_request: Request, { params }: Context) {
  const denied = await requireSession();
  if (denied) return denied;

  const { id } = await params;
  try {
    return NextResponse.json(await getCheckoutState(id), { headers: NO_STORE });
  } catch (error) {
    return bookingErrorResponse(error);
  }
}
