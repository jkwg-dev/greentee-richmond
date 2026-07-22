import { NextResponse } from "next/server";
import { getReservation } from "@/lib/booking/reservations";
import { bookingErrorResponse, NO_STORE, requireSession } from "../../guard";

/** Never cached; a session is required in every mode (booking.md §12.2). */
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

/**
 * GET /api/booking/reservations/{id} (booking.md §12.10): the single
 * reservation, feeding the confirmation screen and the read-only detail. The
 * middleware checks ownership and answers 404 for a reservation this JWT does
 * not own, so a guessed id can never surface another person's booking.
 */
export async function GET(_request: Request, { params }: Context) {
  const denied = await requireSession();
  if (denied) return denied;

  const { id } = await params;
  try {
    return NextResponse.json(await getReservation(id), { headers: NO_STORE });
  } catch (error) {
    return bookingErrorResponse(error);
  }
}
