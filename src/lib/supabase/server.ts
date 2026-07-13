import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Cookie-bound server Supabase clients (booking.md §9.3): the only place a
 * client is created for request handling. No browser client exists; every
 * auth operation is a Server Action. Session refresh lives in the proxy
 * interceptor (src/lib/supabase/session.ts), not here.
 */

/**
 * A fresh client for this request. Never share a client across requests
 * (documented @supabase/ssr rule).
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) {
    throw new Error(
      "Supabase: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are missing. Copy .env.local.example and fill them in (booking.md §9.2).",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component, where Next forbids cookie
          // writes; the proxy's updateSession owns refresh on that path.
        }
      },
    },
  });
}

/** The signed-in user for this request, or null. */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
