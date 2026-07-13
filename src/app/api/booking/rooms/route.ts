import { NextResponse } from "next/server";
import { activeProvider } from "@/lib/booking/provider";

/**
 * GET /api/booking/rooms (booking.md §5.7). Room inventory changes rarely, so
 * this handler is static with a short revalidate window; availability is the
 * never-cached surface.
 */
export const revalidate = 300;

export async function GET() {
  return NextResponse.json(await activeProvider.getRooms());
}
