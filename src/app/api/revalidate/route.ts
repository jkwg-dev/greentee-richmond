import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import type { SanityTag } from "@/sanity/lib/fetch";

/** Document type to §11.5 cache tags. One publish invalidates one surface set. */
const TAGS_BY_TYPE: Record<string, SanityTag[]> = {
  siteSettings: ["settings"],
  homePage: ["home"],
  zone: ["zone"],
  restaurant: ["restaurant"],
  dish: ["dish"],
  event: ["event"],
  promotion: ["promotion"],
  newsPost: ["news"],
};

/**
 * Sanity publish webhook (docs §4.3, §11.5). The GROQ-powered webhook posts
 * `{ _type }` signed with SANITY_REVALIDATE_SECRET; the matching cache tags
 * revalidate so expired offers and fresh publishes land without a deploy.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return new NextResponse("SANITY_REVALIDATE_SECRET is not set", {
      status: 500,
    });
  }

  const { isValidSignature, body } = await parseBody<{ _type?: string }>(
    req,
    secret,
  );
  if (!isValidSignature) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  const tags = body?._type ? TAGS_BY_TYPE[body._type] : undefined;
  if (!tags) {
    return NextResponse.json({
      revalidated: [],
      message: `No tags for type "${body?._type}"`,
    });
  }

  // "max" reproduces classic on-demand invalidation: the next request blocks
  // on fresh data instead of serving stale (Next 16 revalidateTag profiles).
  for (const tag of tags) revalidateTag(tag, "max");
  return NextResponse.json({ revalidated: tags });
}
