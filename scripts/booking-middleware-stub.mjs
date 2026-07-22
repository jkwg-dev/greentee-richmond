#!/usr/bin/env node
/**
 * Dev-only Green Tee middleware stub (booking.md §10.6, §12.7). Dependency
 * free, never deployed, never imported by app code. Emulates the read
 * endpoints and the reserve-and-pay surface with spec-shaped payloads (§4 and
 * its middleware update deltas): Bearer required, deterministic rooms and
 * slots, mandatory idempotency keys on mutations, vendor error envelopes,
 * uppercase vendor codes.
 *
 * Run:
 *   node scripts/booking-middleware-stub.mjs        (port 4141; override with BOOKING_STUB_PORT)
 *
 * The app it redirects back to defaults to http://localhost:3000; override
 * with BOOKING_STUB_APP_ORIGIN.
 *
 * Switches (each applies until switched again):
 *   curl "http://127.0.0.1:4141/__stub/force?mode=unauthorized"   every call answers 401 UNAUTHORIZED
 *   curl "http://127.0.0.1:4141/__stub/force?mode=error"          every call answers 500 INTERNAL
 *   curl "http://127.0.0.1:4141/__stub/force?mode=off"            back to normal
 *   curl "http://127.0.0.1:4141/__stub/checkout?mode=succeeded"   payment outcome: succeeded |
 *                                                                 declined | review_required |
 *                                                                 failed | expired
 *   curl "http://127.0.0.1:4141/__stub/checkout?mode=succeeded&polls=2"
 *                                                                 answer `processing` twice, then the mode
 *   curl "http://127.0.0.1:4141/__stub/refund?status=succeeded"   refund outcome (default review_required,
 *                                                                 the pre-QA fail-closed reality)
 *   curl "http://127.0.0.1:4141/__stub/inflight?key=<key>"        plant an in-flight key (next use answers 409)
 *   curl "http://127.0.0.1:4141/__stub/reset"                     clear reservations, payments, and keys
 *
 * The stub's data is intentionally distinct from the fixtures (a Bay 03
 * with capacity 6, different prices) so live rendering is visibly live.
 */
import { createServer } from "node:http";

const PORT = Number(process.env.BOOKING_STUB_PORT ?? 4141);
const APP_ORIGIN = process.env.BOOKING_STUB_APP_ORIGIN ?? "http://localhost:3000";
const SELF = `http://127.0.0.1:${PORT}`;

const ROOMS = [
  {
    id: "stub-bay-01",
    name: "Bay 01 · Practice",
    maxCapacity: 4,
    description: "Vendor presentation copy, dropped by design (§1).",
    photoUrls: [],
    displayOrder: 1,
  },
  {
    id: "stub-bay-03",
    name: "Bay 03 · Play",
    maxCapacity: 6,
    description: "",
    photoUrls: [],
    displayOrder: 2,
  },
  {
    id: "stub-vip-12",
    name: "VIP Room 12",
    maxCapacity: 8,
    description: "",
    photoUrls: [],
    displayOrder: 3,
  },
];

/** The vendor update §6 example shape, one-per-day cap included. */
const POLICY = {
  advanceBookingDays: 14,
  sameDayCutoffMinutes: 60,
  maxPerDayPerUser: 1,
  maxPerWeekPerUser: 5,
  pendingHoldMinutes: 10,
  checkoutSessionMinutes: 15,
  operatingHours: [1, 2, 3, 4, 5, 6, 0].map((dayOfWeek) => ({
    dayOfWeek,
    isOpen: true,
    openTime: "10:00",
    closeTime: "22:00",
  })),
};

const GST_RATE = 0.05;
const PST_RATE = 0.07;

let forced = "off";
let checkoutMode = "succeeded";
let checkoutPolls = 0;
let refundStatus = "review_required";

/** reservationId -> reservation; reservationId -> payment; scoped key -> record. */
const reservations = new Map();
const payments = new Map();
const keys = new Map();
/** Keys planted by the dev switch to stand in for a request still in flight. */
const plantedInflight = new Set();

const errorEnvelope = (code, message) => ({ error: { code, message } });

function json(res, status, body, requestId) {
  res.writeHead(status, {
    "content-type": "application/json",
    ...(requestId ? { "x-request-id": requestId } : {}),
  });
  res.end(JSON.stringify(body));
}

function html(res, status, body) {
  res.writeHead(status, { "content-type": "text/html; charset=utf-8" });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      if (raw === "") return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(null);
      }
    });
  });
}

/**
 * A stable per-caller id derived from the bearer token, so ownership and the
 * per-day cap behave per user. The token itself is never stored or logged.
 */
function userKey(auth) {
  let hash = 5381;
  for (let index = 0; index < auth.length; index++) {
    hash = ((hash << 5) + hash + auth.charCodeAt(index)) | 0;
  }
  return `u${(hash >>> 0).toString(36)}`;
}

/** Key order never changes a body's identity (the same request must replay). */
function canonical(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`)
    .join(",")}}`;
}

// 30 minute blocks 10:00 to 22:00; every 4th block sits out, deterministically.
function slotsFor(date, room) {
  const boundaries = [];
  for (let hour = 10; hour < 22; hour++) {
    const hh = String(hour).padStart(2, "0");
    boundaries.push(`${hh}:00`, `${hh}:30`);
  }
  boundaries.push("22:00");

  const slots = [];
  for (let index = 0; index < boundaries.length - 1; index++) {
    if (index % 4 === 3) continue;
    const start = boundaries[index];
    const peak = start >= "17:00" && start < "21:00";
    const vip = room.maxCapacity >= 8;
    slots.push({
      roomId: room.id,
      startsAt: `${date}T${start}:00-07:00`,
      endsAt: `${date}T${boundaries[index + 1]}:00-07:00`,
      priceCents: vip ? (peak ? 9900 : 7000) : peak ? 5100 : 3500,
      currency: "CAD",
    });
  }
  return slots;
}

const minutesFromNow = (minutes) =>
  new Date(Date.now() + minutes * 60_000).toISOString();

/**
 * The vendor update §7 server rules: the range must start and end on slot
 * boundaries and every intermediate slot must be open. Returns the summed
 * pre-tax cents, or a rejection reason.
 */
function priceRange({ roomId, startsAt, endsAt }) {
  const room = ROOMS.find((entry) => entry.id === roomId);
  if (!room) return { error: "Unknown room." };

  const slots = slotsFor(startsAt.slice(0, 10), room);
  const first = slots.findIndex((slot) => slot.startsAt === startsAt);
  if (first === -1) {
    return { error: "startsAt does not fall on an availability slot boundary." };
  }

  let subtotalCents = 0;
  for (let index = first; index < slots.length; index++) {
    subtotalCents += slots[index].priceCents;
    if (slots[index].endsAt === endsAt) return { subtotalCents };
    const next = slots[index + 1];
    if (!next || next.startsAt !== slots[index].endsAt) {
      return { error: "The range spans an unavailable slot." };
    }
  }
  return { error: "endsAt does not fall on an availability slot boundary." };
}

function buildReservation(owner, body) {
  const priced = priceRange(body);
  if (priced.error) return { error: priced.error };

  const subtotalCents = priced.subtotalCents;
  const gstCents = Math.round(subtotalCents * GST_RATE);
  const pstCents = Math.round(subtotalCents * PST_RATE);
  const room = ROOMS.find((entry) => entry.id === body.roomId);

  return {
    reservation: {
      id: crypto.randomUUID(),
      owner,
      roomId: body.roomId,
      roomName: room.name,
      startsAt: body.startsAt,
      endsAt: body.endsAt,
      partySize: body.partySize,
      status: "pending",
      subtotalCents,
      gstCents,
      pstCents,
      totalCents: subtotalCents + gstCents + pstCents,
      currency: "CAD",
      expiresAt: minutesFromNow(POLICY.pendingHoldMinutes),
      code: null,
    },
  };
}

/** The reservation as the wire sees it: `owner` is stub bookkeeping. */
const publicReservation = ({ owner: _owner, ...rest }) => rest;

/**
 * The vendor update §4 idempotency contract, keyed the way the middleware
 * derives it (`userId | method | path | clientKey`): the same key with the
 * same body replays, with a different body is 422, and while in flight is 409.
 * Returns a response to send, or null when the caller should do the work.
 */
function idempotencyGate(res, requestId, scope, key, body) {
  if (typeof key !== "string" || key.length < 8 || key.length > 255) {
    json(
      res,
      422,
      errorEnvelope(
        "VALIDATION_FAILED",
        "Idempotency-Key is required and must be 8 to 255 characters.",
      ),
      requestId,
    );
    return true;
  }

  if (plantedInflight.has(key)) {
    plantedInflight.delete(key);
    json(
      res,
      409,
      errorEnvelope("CONFLICT", "That request is already being processed."),
      requestId,
    );
    return true;
  }

  const scoped = `${scope}|${key}`;
  const record = keys.get(scoped);
  if (!record) return false;

  if (record.phase === "inflight") {
    json(
      res,
      409,
      errorEnvelope("CONFLICT", "That request is already being processed."),
      requestId,
    );
    return true;
  }
  if (record.bodyHash !== canonical(body)) {
    json(
      res,
      422,
      errorEnvelope(
        "VALIDATION_FAILED",
        "That Idempotency-Key was already used with a different request body.",
      ),
      requestId,
    );
    return true;
  }
  json(res, record.status, record.body, requestId);
  return true;
}

function remember(scope, key, body, status, response) {
  keys.set(`${scope}|${key}`, {
    phase: "done",
    bodyHash: canonical(body),
    status,
    body: response,
  });
}

/** The stub's Hosted Checkout stand-in: an external origin the browser visits and returns from. */
function monerisPage(url, res) {
  const ticket = url.searchParams.get("ticket") ?? "";
  const reservationId = url.searchParams.get("reservationId") ?? "";
  const returnTo = (mode) =>
    `${SELF}/__stub/moneris/return?reservationId=${encodeURIComponent(reservationId)}&ticket=${encodeURIComponent(ticket)}&mode=${mode}`;

  const link = (mode, label) =>
    `<li><a href="${returnTo(mode)}">${label}</a></li>`;

  html(
    res,
    200,
    `<!doctype html><html><head><meta charset="utf-8">
<title>Stub Hosted Checkout</title>
<meta http-equiv="refresh" content="0;url=${returnTo(checkoutMode)}">
</head><body style="font:14px system-ui;padding:2rem">
<h1>Stub Hosted Checkout</h1>
<p>Returning with the current switch: <strong>${checkoutMode}</strong>.</p>
<ul>
${link("succeeded", "Return as succeeded")}
${link("declined", "Return as declined")}
${link("review_required", "Return as review_required")}
${link("failed", "Return as failed")}
${link("expired", "Return as an expired ticket")}
</ul>
</body></html>`,
  );
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, SELF);
  const requestId = req.headers["x-request-id"] ?? "";
  const path = url.pathname;

  // ---- dev switches and the Hosted Checkout stand-in (no auth) ----

  if (path === "/__stub/force") {
    const mode = url.searchParams.get("mode") ?? "off";
    forced = ["unauthorized", "error"].includes(mode) ? mode : "off";
    console.log(`[stub] forced mode: ${forced}`);
    return json(res, 200, { forced });
  }

  if (path === "/__stub/checkout") {
    const mode = url.searchParams.get("mode") ?? "succeeded";
    checkoutMode = [
      "succeeded",
      "declined",
      "review_required",
      "failed",
      "expired",
    ].includes(mode)
      ? mode
      : "succeeded";
    checkoutPolls = Number(url.searchParams.get("polls") ?? 0) || 0;
    console.log(`[stub] checkout mode: ${checkoutMode}, processing polls: ${checkoutPolls}`);
    return json(res, 200, { checkoutMode, checkoutPolls });
  }

  if (path === "/__stub/refund") {
    refundStatus = url.searchParams.get("status") ?? "review_required";
    console.log(`[stub] refund status: ${refundStatus}`);
    return json(res, 200, { refundStatus });
  }

  if (path === "/__stub/inflight") {
    const key = url.searchParams.get("key") ?? "";
    // Planted by key alone: the caller cannot derive the internal scope, and
    // the next use of this key answers 409 exactly as a real one in flight.
    plantedInflight.add(key);
    console.log("[stub] planted an in-flight key");
    return json(res, 200, { planted: true });
  }

  if (path === "/__stub/reset") {
    reservations.clear();
    payments.clear();
    keys.clear();
    console.log("[stub] state cleared");
    return json(res, 200, { reset: true });
  }

  if (path === "/__stub/moneris") return monerisPage(url, res);

  if (path === "/__stub/moneris/return") {
    const reservationId = url.searchParams.get("reservationId") ?? "";
    const ticket = url.searchParams.get("ticket") ?? "";
    const mode = url.searchParams.get("mode") ?? checkoutMode;
    const payment = payments.get(reservationId);
    if (payment) payment.mode = mode;
    const target = `${APP_ORIGIN}/book/checkout/callback?reservationId=${encodeURIComponent(reservationId)}&ticket=${encodeURIComponent(ticket)}&mode=${encodeURIComponent(mode)}`;
    console.log(`[stub] hosted checkout returning as ${mode}`);
    res.writeHead(302, { location: target });
    return res.end();
  }

  // ---- the customer API ----

  const auth = req.headers.authorization ?? "";
  console.log(
    `[stub] ${req.method} ${path}${url.search} | authorization: ${
      auth ? `${auth.slice(0, 24)}...` : "(none)"
    } | x-request-id: ${requestId || "(none)"}`,
  );

  if (forced === "unauthorized" || !auth.startsWith("Bearer ")) {
    return json(
      res,
      401,
      errorEnvelope("UNAUTHORIZED", "Missing or invalid bearer token."),
      requestId,
    );
  }
  if (forced === "error") {
    return json(
      res,
      500,
      errorEnvelope("INTERNAL", "Forced stub failure."),
      requestId,
    );
  }

  const owner = userKey(auth);
  const idempotencyKey = req.headers["idempotency-key"];

  if (path === "/api/v1/simulator/rooms") {
    return json(res, 200, ROOMS, requestId);
  }

  if (path === "/api/v1/simulator/policies/booking") {
    return json(res, 200, POLICY, requestId);
  }

  if (path === "/api/v1/simulator/availability") {
    const date = url.searchParams.get("date");
    const partySize = Number(url.searchParams.get("partySize"));
    if (
      !date ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isInteger(partySize) ||
      partySize < 1
    ) {
      return json(
        res,
        400,
        errorEnvelope("VALIDATION_FAILED", "date and partySize are required."),
        requestId,
      );
    }
    const roomId = url.searchParams.get("roomId") ?? undefined;
    const open = ROOMS.filter(
      (room) =>
        (!roomId || room.id === roomId) && room.maxCapacity >= partySize,
    );
    if (open.length === 0) {
      return json(
        res,
        200,
        { date, slots: [], reasons: ["no_rooms"] },
        requestId,
      );
    }
    return json(
      res,
      200,
      {
        date,
        slots: open.flatMap((room) => slotsFor(date, room)),
        reasons: [],
      },
      requestId,
    );
  }

  // POST /api/v1/simulator/reservations
  if (path === "/api/v1/simulator/reservations" && req.method === "POST") {
    const body = await readBody(req);
    if (!body) {
      return json(
        res,
        400,
        errorEnvelope("VALIDATION_FAILED", "A JSON body is required."),
        requestId,
      );
    }
    const scope = `${owner}|POST|${path}`;
    if (idempotencyGate(res, requestId, scope, idempotencyKey, body)) return;

    const { roomId, startsAt, endsAt, partySize } = body;
    if (!roomId || !startsAt || !endsAt || !Number.isInteger(partySize)) {
      return json(
        res,
        400,
        errorEnvelope(
          "VALIDATION_FAILED",
          "roomId, startsAt, endsAt, and partySize are required.",
        ),
        requestId,
      );
    }

    // The per-day cap, enforced the way the vendor's policy states it.
    const date = String(startsAt).slice(0, 10);
    const sameDay = [...reservations.values()].filter(
      (entry) =>
        entry.owner === owner &&
        entry.startsAt.slice(0, 10) === date &&
        entry.status !== "cancelled",
    );
    if (POLICY.maxPerDayPerUser && sameDay.length >= POLICY.maxPerDayPerUser) {
      const capped = errorEnvelope(
        "VALIDATION_FAILED",
        "This account already has a reservation on that date.",
      );
      remember(scope, idempotencyKey, body, 422, capped);
      return json(res, 422, capped, requestId);
    }

    const built = buildReservation(owner, body);
    if (built.error) {
      const rejected = errorEnvelope("VALIDATION_FAILED", built.error);
      remember(scope, idempotencyKey, body, 422, rejected);
      return json(res, 422, rejected, requestId);
    }

    reservations.set(built.reservation.id, built.reservation);
    const payload = publicReservation(built.reservation);
    remember(scope, idempotencyKey, body, 201, payload);
    return json(res, 201, payload, requestId);
  }

  const reservationRoute = path.match(
    /^\/api\/v1\/simulator\/reservations\/([^/]+)(\/checkout\/session|\/checkout\/complete|\/checkout|\/cancel)?$/,
  );

  if (reservationRoute) {
    const [, rawId, leaf] = reservationRoute;
    const id = decodeURIComponent(rawId);
    const reservation = reservations.get(id);
    // Ownership first: a reservation this caller does not own is a 404, so an
    // id alone never reveals another person's booking (vendor update §10).
    if (!reservation || reservation.owner !== owner) {
      return json(
        res,
        404,
        errorEnvelope("NOT_FOUND", "No such reservation."),
        requestId,
      );
    }

    // GET the reservation detail.
    if (!leaf && req.method === "GET") {
      return json(res, 200, publicReservation(reservation), requestId);
    }

    // POST checkout/session
    if (leaf === "/checkout/session" && req.method === "POST") {
      const scope = `${owner}|POST|${path}`;
      if (idempotencyGate(res, requestId, scope, idempotencyKey, {})) return;

      const existing = payments.get(id);
      if (existing && ["processing", "review_required"].includes(existing.status)) {
        return json(
          res,
          409,
          errorEnvelope("CONFLICT", "Checkout is already processing."),
          requestId,
        );
      }

      const payment = {
        paymentId: crypto.randomUUID(),
        ticket: `stub-ticket-${crypto.randomUUID()}`,
        expiresAt: minutesFromNow(POLICY.checkoutSessionMinutes),
        status: "processing",
        mode: checkoutMode,
        pollsLeft: checkoutPolls,
        amountCents: reservation.totalCents,
      };
      payments.set(id, payment);

      const payload = {
        paymentId: payment.paymentId,
        ticket: payment.ticket,
        expiresAt: payment.expiresAt,
        environment: "stub",
        // Not a vendor field: the documented session response carries no URL,
        // so the stub supplies the Hosted Checkout origin it stands in for.
        checkoutUrl: `${SELF}/__stub/moneris?ticket=${encodeURIComponent(payment.ticket)}&reservationId=${encodeURIComponent(id)}`,
      };
      remember(scope, idempotencyKey, {}, 201, payload);
      return json(res, 201, payload, requestId);
    }

    // POST checkout/complete
    if (leaf === "/checkout/complete" && req.method === "POST") {
      const body = await readBody(req);
      if (!body) {
        return json(
          res,
          400,
          errorEnvelope("VALIDATION_FAILED", "A JSON body is required."),
          requestId,
        );
      }
      const scope = `${owner}|POST|${path}`;
      if (idempotencyGate(res, requestId, scope, idempotencyKey, body)) return;

      const payment = payments.get(id);
      if (!payment || payment.ticket !== body.ticket) {
        const rejected = errorEnvelope(
          "VALIDATION_FAILED",
          "That checkout ticket is not valid for this reservation.",
        );
        remember(scope, idempotencyKey, body, 422, rejected);
        return json(res, 422, rejected, requestId);
      }
      if (payment.mode === "expired") {
        const expired = errorEnvelope(
          "VALIDATION_FAILED",
          "That checkout ticket has expired.",
        );
        remember(scope, idempotencyKey, body, 422, expired);
        return json(res, 422, expired, requestId);
      }

      const status = settle(id, payment, reservation);
      const payload = { status };
      remember(scope, idempotencyKey, body, 200, payload);
      return json(res, 200, payload, requestId);
    }

    // GET checkout status
    if (leaf === "/checkout" && req.method === "GET") {
      const payment = payments.get(id);
      if (!payment) {
        return json(
          res,
          404,
          errorEnvelope("NOT_FOUND", "No checkout for this reservation."),
          requestId,
        );
      }
      const status = settle(id, payment, reservation);
      return json(
        res,
        200,
        {
          paymentId: payment.paymentId,
          status,
          amountCents: payment.amountCents,
          currency: "CAD",
          expiresAt: payment.expiresAt,
          failureMessage: null,
        },
        requestId,
      );
    }

    // POST cancel
    if (leaf === "/cancel" && req.method === "POST") {
      const scope = `${owner}|POST|${path}`;
      if (idempotencyGate(res, requestId, scope, idempotencyKey, {})) return;

      const payment = payments.get(id);
      if (payment && ["processing", "review_required"].includes(payment.status)) {
        return json(
          res,
          409,
          errorEnvelope(
            "CONFLICT",
            "Payment is still settling; cancellation is blocked.",
          ),
          requestId,
        );
      }

      reservation.status = "cancelled";
      const refundCents =
        payment?.status === "succeeded" ? Math.round(reservation.totalCents / 2) : 0;
      const payload = {
        reservation: { id: reservation.id, status: "cancelled" },
        refundCents,
        refundAmountCents: refundCents,
        refundPercent: refundCents ? 50 : 0,
        // Pre-QA the refund adapter fails closed (vendor update §15), so the
        // default here is review_required, never succeeded.
        refundStatus: refundCents ? refundStatus : null,
      };
      remember(scope, idempotencyKey, {}, 200, payload);
      return json(res, 200, payload, requestId);
    }
  }

  json(
    res,
    404,
    errorEnvelope("NOT_FOUND", `No stub route for ${path}`),
    requestId,
  );
});

/**
 * Walks a payment to its outcome: `polls` answers of `processing` first, then
 * the switch's terminal status. A succeeded payment confirms its reservation,
 * which is the only thing that ever does (booking.md §4 deltas).
 */
function settle(id, payment, reservation) {
  if (payment.status !== "processing") return payment.status;
  if (payment.pollsLeft > 0) {
    payment.pollsLeft -= 1;
    return "processing";
  }
  payment.status = payment.mode === "expired" ? "failed" : payment.mode;
  if (payment.status === "succeeded") {
    reservation.status = "confirmed";
    reservation.code = `GT-${id.slice(0, 8).toUpperCase()}`;
  }
  return payment.status;
}

server.listen(PORT, "127.0.0.1", () => {
  console.log("[stub] Green Tee middleware stub listening.");
  console.log(`[stub] export BOOKING_API_BASE_URL=${SELF}`);
  console.log(`[stub] returning browsers to ${APP_ORIGIN}`);
});
