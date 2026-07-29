// Cancel-and-refund QA harness (booking.md §14, B3d-2).
//
// Exercises the vendor cancel contract end to end against a base URL: a
// confirmed reservation in the 100 percent bracket (cancelled 24h+ before
// start) and an unpaid pending cancel (the zero-refund case). It records the
// raw refundStatus the server returns for each, which is environment dependent
// (staging mock settles a refundable amount to succeeded; the pre-QA
// fail-closed default is review_required). The bracket percent is asserted; the
// raw refundStatus is observed and reported, never asserted.
//
// It talks to the vendor middleware the same way our route handlers do: server
// to server, a Bearer token, and a distinct per-operation Idempotency-Key on
// every mutation. Tokens and keys are never printed.
//
// Usage:
//   BOOKING_QA_BEARER=<token> \
//   [BASE_URL=http://127.0.0.1:4141] [ROOM_ID=stub-bay-01] [PARTY=2] \
//   node scripts/booking-cancel-qa.mjs
//
// Against staging: BASE_URL=https://web-server-ten-mu.vercel.app, a real QA
// Supabase access token in BOOKING_QA_BEARER, and a real ROOM_ID. Against the
// local stub (booking-middleware-stub.mjs) any Bearer value works; reset it
// first (/__stub/reset) so the per-day cap does not reject fresh reservations.

import { randomUUID } from "node:crypto";

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:4141";
const BEARER = process.env.BOOKING_QA_BEARER;
const ROOM_ID = process.env.ROOM_ID ?? "stub-bay-01";
const PARTY = Number(process.env.PARTY ?? 2);
const PREFIX = "/api/v1/simulator";

if (!BEARER) {
  console.error("BOOKING_QA_BEARER is required (a QA bearer token).");
  process.exit(2);
}

/** A per-operation key in our own format, inside the vendor's 8 to 255 bounds. */
const newKey = (op) => `${op}-${randomUUID()}`;

async function call(method, path, { body, idempotencyKey } = {}) {
  const headers = { authorization: `Bearer ${BEARER}` };
  if (body) headers["content-type"] = "application/json";
  if (idempotencyKey) headers["idempotency-key"] = idempotencyKey;
  const res = await fetch(`${BASE_URL}${PREFIX}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const code = json?.error?.code ?? `http_${res.status}`;
    const message = json?.error?.message ?? "";
    throw new Error(`${method} ${path} -> ${res.status} ${code} ${message}`);
  }
  return json;
}

/** A 30-minute block `daysAhead` out, at 14:00 venue time (well inside 24h). */
function slot(daysAhead) {
  const date = new Date(Date.now() + daysAhead * 86_400_000)
    .toISOString()
    .slice(0, 10);
  return {
    roomId: ROOM_ID,
    startsAt: `${date}T14:00:00-07:00`,
    endsAt: `${date}T14:30:00-07:00`,
    partySize: PARTY,
  };
}

async function createReservation(daysAhead) {
  return call("POST", "/reservations", {
    body: slot(daysAhead),
    idempotencyKey: newKey("reservation"),
  });
}

async function payToConfirmed(id) {
  const session = await call("POST", `/reservations/${id}/checkout/session`, {
    body: {},
    idempotencyKey: newKey("checkout-session"),
  });
  const done = await call("POST", `/reservations/${id}/checkout/complete`, {
    body: { ticket: session.ticket },
    idempotencyKey: newKey("checkout-complete"),
  });
  if (done.status !== "succeeded") {
    throw new Error(`checkout did not confirm: status ${done.status}`);
  }
  const detail = await call("GET", `/reservations/${id}`);
  if (detail.status !== "confirmed") {
    throw new Error(`reservation not confirmed: status ${detail.status}`);
  }
}

async function cancel(id) {
  return call("POST", `/reservations/${id}/cancel`, {
    idempotencyKey: newKey("cancellation"),
  });
}

function check(label, condition) {
  console.log(`  ${condition ? "PASS" : "FAIL"}  ${label}`);
  return condition;
}

async function main() {
  console.log(`Cancel QA against ${BASE_URL}${PREFIX}\n`);
  let ok = true;

  // Case A: a paid (confirmed) reservation cancelled 24h+ before start.
  console.log("Case A: confirmed cancel, 100 percent bracket");
  const a = await createReservation(2);
  await payToConfirmed(a.id);
  const ra = await cancel(a.id);
  ok = check("refundPercent is 100", ra.refundPercent === 100) && ok;
  ok = check("refundAmountCents equals total", ra.refundAmountCents === a.totalCents) && ok;
  ok = check("reservation is cancelled", ra.reservation.status === "cancelled") && ok;
  console.log(`  observed raw refundStatus: ${JSON.stringify(ra.refundStatus)}\n`);

  // Case B: an unpaid pending reservation. No captured payment, so no refund.
  console.log("Case B: unpaid pending cancel, zero refund");
  const b = await createReservation(3);
  const rb = await cancel(b.id);
  ok = check("refundAmountCents is 0", rb.refundAmountCents === 0) && ok;
  ok = check("refundStatus is null", rb.refundStatus === null) && ok;
  ok = check("reservation is cancelled", rb.reservation.status === "cancelled") && ok;
  console.log(`  observed raw refundStatus: ${JSON.stringify(rb.refundStatus)}\n`);

  console.log(ok ? "All checks passed." : "Some checks failed.");
  process.exit(ok ? 0 : 1);
}

main().catch((error) => {
  console.error(`QA run failed: ${error.message}`);
  process.exit(1);
});
