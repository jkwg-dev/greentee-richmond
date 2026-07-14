#!/usr/bin/env node
/**
 * Dev-only Green Tee middleware stub (booking.md §10.6). Dependency free,
 * never deployed, never imported by app code. Emulates the two read
 * endpoints with spec-shaped payloads (§4): Bearer required, deterministic
 * rooms and slots, vendor error envelopes, uppercase vendor codes.
 *
 * Run:
 *   node scripts/booking-middleware-stub.mjs        (port 4141; override with BOOKING_STUB_PORT)
 *
 * Force failure modes (applies to every subsequent call until switched off):
 *   curl "http://127.0.0.1:4141/__stub/force?mode=unauthorized"   every call answers 401 UNAUTHORIZED
 *   curl "http://127.0.0.1:4141/__stub/force?mode=error"          every call answers 500 INTERNAL
 *   curl "http://127.0.0.1:4141/__stub/force?mode=off"            back to normal
 *
 * The stub's data is intentionally distinct from the fixtures (a Bay 03
 * with capacity 6, different prices) so live rendering is visibly live.
 */
import { createServer } from "node:http";

const PORT = Number(process.env.BOOKING_STUB_PORT ?? 4141);

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

let forced = "off";

const errorEnvelope = (code, message) => ({ error: { code, message } });

function json(res, status, body, requestId) {
  res.writeHead(status, {
    "content-type": "application/json",
    ...(requestId ? { "x-request-id": requestId } : {}),
  });
  res.end(JSON.stringify(body));
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

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const requestId = req.headers["x-request-id"] ?? "";

  if (url.pathname === "/__stub/force") {
    const mode = url.searchParams.get("mode") ?? "off";
    forced = ["unauthorized", "error"].includes(mode) ? mode : "off";
    console.log(`[stub] forced mode: ${forced}`);
    return json(res, 200, { forced });
  }

  const auth = req.headers.authorization ?? "";
  console.log(
    `[stub] ${req.method} ${url.pathname}${url.search} | authorization: ${
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

  if (url.pathname === "/api/v1/simulator/rooms") {
    return json(res, 200, ROOMS, requestId);
  }

  if (url.pathname === "/api/v1/simulator/availability") {
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

  json(
    res,
    404,
    errorEnvelope("NOT_FOUND", `No stub route for ${url.pathname}`),
    requestId,
  );
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("[stub] Green Tee middleware stub listening.");
  console.log(`[stub] export BOOKING_API_BASE_URL=http://127.0.0.1:${PORT}`);
});
