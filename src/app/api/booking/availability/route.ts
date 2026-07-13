import { type NextRequest, NextResponse } from "next/server";
import { activeProvider } from "@/lib/booking/provider";

/** Availability responses are never cached (booking.md §2). */
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

/** The booking.md §4 error envelope. */
function badRequest(code: string, message: string) {
  return NextResponse.json(
    { error: { code, message } },
    { status: 400, headers: NO_STORE },
  );
}

/** `YYYY-MM-DD` and a real calendar date (rejects 2026-02-31). */
function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * GET /api/booking/availability?date&partySize[&roomId] (booking.md §4, §5.7).
 * Validates the query, then defers to the active provider: the fixtures in
 * B1, the vendor middleware in B3.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const date = params.get("date");
  if (!date || !isCalendarDate(date)) {
    return badRequest(
      "invalid_date",
      "date must be a valid YYYY-MM-DD calendar date.",
    );
  }

  const partySizeRaw = params.get("partySize");
  if (!partySizeRaw || !/^\d+$/.test(partySizeRaw)) {
    return badRequest(
      "invalid_party_size",
      "partySize must be a positive integer.",
    );
  }
  const partySize = Number(partySizeRaw);
  if (partySize < 1) {
    return badRequest(
      "invalid_party_size",
      "partySize must be a positive integer.",
    );
  }

  const roomId = params.get("roomId") ?? undefined;
  if (roomId === "") {
    return badRequest(
      "invalid_room_id",
      "roomId, when present, must be a non-empty string.",
    );
  }

  const availability = await activeProvider.getAvailability({
    date,
    partySize,
    roomId,
  });
  return NextResponse.json(availability, { headers: NO_STORE });
}
