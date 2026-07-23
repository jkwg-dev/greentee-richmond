import { type NextRequest, NextResponse } from "next/server";
import { resolveIdempotencyKey } from "@/lib/booking/idempotency";
import {
  createReservation,
  listReservations,
  type CreateReservationInput,
} from "@/lib/booking/reservations";
import type { ReservationCreated } from "@/types/booking";
import { badRequest, bookingErrorResponse, NO_STORE, requireSession } from "../guard";

/** A mutation and a user-specific read; never cached, always session-gated (booking.md §12.2, §13.2). */
export const dynamic = "force-dynamic";

/**
 * GET /api/booking/reservations (booking.md §13.2): the signed-in user's
 * reservations, one page. Relays an optional opaque cursor and answers with the
 * items plus the next cursor. No idempotency key; it is a read.
 */
export async function GET(request: NextRequest) {
  const denied = await requireSession();
  if (denied) return denied;

  const cursor = request.nextUrl.searchParams.get("cursor") ?? undefined;
  try {
    const list = await listReservations(cursor);
    return NextResponse.json(list, { headers: NO_STORE });
  } catch (error) {
    return bookingErrorResponse(error);
  }
}

/** The client's create payload, before validation. */
type CreateBody = Partial<Record<keyof CreateReservationInput, unknown>> & {
  idempotencyKey?: unknown;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "";

/**
 * POST /api/booking/reservations (booking.md §12.2): one reservation over the
 * selection's contiguous range. The range endpoints are echoed exactly as the
 * availability response gave them, so they are validated as non-empty strings
 * and never parsed, reformatted, or recomputed here.
 *
 * The handler generates the `reservation-<uuid>` idempotency key and returns
 * it, so a caller whose request timed out resends the identical key with the
 * identical body instead of issuing a new one.
 */
export async function POST(request: NextRequest) {
  const denied = await requireSession();
  if (denied) return denied;

  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return badRequest("invalid_body", "A JSON body is required.");
  }

  if (!isNonEmptyString(body.roomId)) {
    return badRequest("invalid_room_id", "roomId is required.");
  }
  if (!isNonEmptyString(body.startsAt) || !isNonEmptyString(body.endsAt)) {
    return badRequest(
      "invalid_range",
      "startsAt and endsAt are required, exactly as availability returned them.",
    );
  }
  if (
    typeof body.partySize !== "number" ||
    !Number.isInteger(body.partySize) ||
    body.partySize < 1
  ) {
    return badRequest("invalid_party_size", "partySize must be a positive integer.");
  }
  if (body.customerNotes !== undefined && typeof body.customerNotes !== "string") {
    return badRequest("invalid_notes", "customerNotes, when present, must be a string.");
  }

  const idempotencyKey = resolveIdempotencyKey("reservation", body.idempotencyKey);

  try {
    const reservation = await createReservation(
      {
        roomId: body.roomId,
        startsAt: body.startsAt,
        endsAt: body.endsAt,
        partySize: body.partySize,
        ...(body.customerNotes ? { customerNotes: body.customerNotes } : {}),
      },
      idempotencyKey,
    );
    const payload: ReservationCreated = { reservation, idempotencyKey };
    return NextResponse.json(payload, { headers: NO_STORE });
  } catch (error) {
    return bookingErrorResponse(error);
  }
}
