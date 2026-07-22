import "server-only";

import { createClient } from "@/lib/supabase/server";
import { bookingApiBaseUrl } from "./config";
import {
  BookingApiError,
  BookingAuthError,
  BookingConflictError,
  BookingRuleError,
} from "./errors";

/**
 * The one way this app talks to the Green Tee middleware (booking.md §10.2,
 * §12.2). Every call relays the current user's JWT, read inside the request
 * scope and never cached or shared across requests; every mutation carries a
 * caller-supplied `Idempotency-Key`.
 *
 * Nothing here logs a token, a key, a ticket, or a request body. Failures log
 * the path, the status, the vendor code, and the `x-request-id` only, which is
 * what a support inquiry needs (CLAUDE.md booking track rules).
 */

/** The §4 vendor error envelope. */
type VendorErrorEnvelope = { error?: { code?: string; message?: string } };

/** Read caching per booking.md §2: availability never, room and policy data may. */
export type VendorCache = { revalidate: number } | "no-store";

type VendorRequest = {
  /** GET by default; a mutation must supply its own idempotency key. */
  method?: "GET" | "POST";
  cache?: VendorCache;
  /** Required on create, checkout session, checkout complete, and cancel (§4 deltas). */
  idempotencyKey?: string;
  body?: unknown;
};

/** This request's access token; a typed auth error when there is no session. */
async function accessToken(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new BookingAuthError();
  return session.access_token;
}

/**
 * Maps a failed vendor response onto our typed errors. `409` and `422` stay
 * distinguishable so the UI can answer them per §12.6 instead of falling into
 * the generic error state.
 */
function mapFailure(
  status: number,
  code: string,
  path: string,
  requestId: string,
  vendorMessage: string,
): never {
  // The raw vendor message stays in the server log with the request id;
  // handlers and the UI only ever see our mapped envelope (§10.2).
  console.error(
    `Booking middleware: ${path} failed ${status} ${code} (x-request-id ${requestId}): ${vendorMessage}`,
  );
  if (status === 401 || code === "UNAUTHORIZED") {
    throw new BookingAuthError();
  }
  if (status === 409 || code === "CONFLICT") {
    throw new BookingConflictError("That time is no longer available.");
  }
  if (status === 422) {
    throw new BookingRuleError("The booking system declined that request.");
  }
  if (status === 400 || code === "VALIDATION_FAILED") {
    throw new BookingApiError(
      400,
      "validation_failed",
      "The booking request was invalid.",
    );
  }
  if (status === 404 || code === "NOT_FOUND") {
    throw new BookingApiError(404, "not_found", "That reservation was not found.");
  }
  throw new BookingApiError(
    502,
    "upstream_error",
    "The booking service is unavailable.",
  );
}

export async function vendorRequest<T>(
  path: string,
  { method = "GET", cache = "no-store", idempotencyKey, body }: VendorRequest = {},
): Promise<T> {
  const token = await accessToken();
  const requestId = crypto.randomUUID();

  const response = await fetch(`${bookingApiBaseUrl()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "x-request-id": requestId,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    // Mutations are never cached; reads say which they are.
    ...(method !== "GET" || cache === "no-store"
      ? { cache: "no-store" as const }
      : { next: cache }),
  });

  if (!response.ok) {
    let envelope: VendorErrorEnvelope = {};
    try {
      envelope = (await response.json()) as VendorErrorEnvelope;
    } catch {
      // Non-JSON failure body; the status alone carries the mapping.
    }
    mapFailure(
      response.status,
      envelope.error?.code ?? `HTTP_${response.status}`,
      path,
      requestId,
      envelope.error?.message ?? response.statusText,
    );
  }

  return response.json() as Promise<T>;
}
