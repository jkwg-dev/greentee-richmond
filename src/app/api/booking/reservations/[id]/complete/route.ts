import { NextResponse } from "next/server";
import { resolveIdempotencyKey } from "@/lib/booking/idempotency";
import { completeCheckout } from "@/lib/booking/reservations";
import type { CheckoutCompleted } from "@/types/booking";
import {
  badRequest,
  bookingErrorResponse,
  NO_STORE,
  requireSession,
} from "../../../guard";

/** A mutation, never cached; a session is required in every mode (booking.md §12.2). */
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };
type CompleteBody = { ticket?: unknown; idempotencyKey?: unknown };

/**
 * POST /api/booking/reservations/{id}/complete (booking.md §12.2): hands the
 * Hosted Checkout ticket back for server-to-server receipt verification. This
 * is the only thing that may turn a reservation into a confirmed one; the
 * browser callback that preceded it proves nothing (§12.3).
 */
export async function POST(request: Request, { params }: Context) {
  const denied = await requireSession();
  if (denied) return denied;

  const { id } = await params;

  let body: CompleteBody;
  try {
    body = (await request.json()) as CompleteBody;
  } catch {
    return badRequest("invalid_body", "A JSON body is required.");
  }
  if (typeof body.ticket !== "string" || body.ticket === "") {
    return badRequest("invalid_ticket", "ticket is required.");
  }

  const idempotencyKey = resolveIdempotencyKey(
    "checkout-complete",
    body.idempotencyKey,
  );

  try {
    const status = await completeCheckout(id, body.ticket, idempotencyKey);
    const payload: CheckoutCompleted = { status, idempotencyKey };
    return NextResponse.json(payload, { headers: NO_STORE });
  } catch (error) {
    return bookingErrorResponse(error);
  }
}
