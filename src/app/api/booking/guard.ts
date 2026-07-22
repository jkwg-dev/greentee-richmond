import "server-only";

import { NextResponse } from "next/server";
import { isBookingLive } from "@/lib/booking/config";
import { BookingApiError, BookingAuthError } from "@/lib/booking/errors";
import { createClient } from "@/lib/supabase/server";

/**
 * Shared handler plumbing for /api/booking/* (booking.md §10.3): the live
 * mode session requirement and the provider-failure to §4 envelope mapping.
 * Middleware-backed data is never served from an unauthenticated path.
 */

export const NO_STORE = { "Cache-Control": "no-store" };

/** The booking.md §4 error envelope, for input this handler rejects itself. */
export function badRequest(code: string, message: string): NextResponse {
  return NextResponse.json(
    { error: { code, message } },
    { status: 400, headers: NO_STORE },
  );
}

const unauthorized = () =>
  NextResponse.json(
    {
      error: { code: "unauthorized", message: "Sign in to load booking data." },
    },
    { status: 401, headers: NO_STORE },
  );

async function hasSession(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return Boolean(session);
}

/** A 401 envelope when live mode has no session; null when clear to proceed. */
export async function requireLiveSession(): Promise<NextResponse | null> {
  if (!isBookingLive()) return null;
  return (await hasSession()) ? null : unauthorized();
}

/**
 * The reserve and checkout handlers require a session in every mode
 * (booking.md §12.2), not only live mode: a mutation is always somebody's, and
 * the relayed JWT is what the middleware checks ownership against.
 */
export async function requireSession(): Promise<NextResponse | null> {
  return (await hasSession()) ? null : unauthorized();
}

/** Provider failures to the §4 envelope; unknown failures log and answer 500. */
export function bookingErrorResponse(error: unknown): NextResponse {
  if (error instanceof BookingAuthError) return unauthorized();
  if (error instanceof BookingApiError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status, headers: NO_STORE },
    );
  }
  console.error("Booking handler: unexpected failure", error);
  return NextResponse.json(
    {
      error: {
        code: "internal",
        message: "Something went wrong loading booking data.",
      },
    },
    { status: 500, headers: NO_STORE },
  );
}
