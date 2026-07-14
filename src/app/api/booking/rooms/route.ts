import { NextResponse } from "next/server";
import { activeProvider } from "@/lib/booking/provider";
import { bookingErrorResponse, requireLiveSession } from "../guard";

/**
 * GET /api/booking/rooms (booking.md §10.3). The handler is dynamic; caching
 * lives in the upstream fetch only (revalidate 300 inside the middleware
 * provider; fixture data needs none). Live mode requires a session.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireLiveSession();
  if (denied) return denied;

  try {
    return NextResponse.json(await activeProvider.getRooms());
  } catch (error) {
    return bookingErrorResponse(error);
  }
}
