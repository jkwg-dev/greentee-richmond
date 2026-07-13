import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

/**
 * Root request interceptor. Next 16 names this file proxy.ts (middleware.ts
 * before 16; booking.md §9.3). Its only job is the Supabase session refresh;
 * there is no gate anywhere in B2, and gate placement waits on the vendor's
 * guest access answer (booking.md §9.1).
 */
export default async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Skip Next internals, the favicon, and any path whose final segment has a
  // file extension; run on every page and API route.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.[^/]+$).*)"],
};
