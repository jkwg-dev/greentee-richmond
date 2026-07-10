import { draftMode } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Clears the Draft Mode cookie set by the Presentation tool (docs §11.5), so
 * the browser returns to the published site. Linked from the Exit pill the
 * site layout shows while draft mode is on.
 */
export async function GET(request: NextRequest) {
  (await draftMode()).disable();
  return NextResponse.redirect(new URL("/", request.url));
}
