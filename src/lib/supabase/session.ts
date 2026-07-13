import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Session refresh for the root request interceptor (booking.md §9.3).
 * Refreshed auth tokens are written to both the request (for this render)
 * and the response (for the browser), per the documented @supabase/ssr
 * pattern. NOTHING may run between createServerClient and auth.getUser();
 * code in that gap causes random sign outs (documented Supabase footgun).
 */
export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Unconfigured environment: pass through. Mirrors the Sanity convention
  // that local builds never depend on live credentials (docs §11.5).
  if (!supabaseUrl || !publishableKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Nothing runs between client creation and this call (booking.md §9.3).
  await supabase.auth.getUser();

  return supabaseResponse;
}
