import { sampleNewsEntries } from "@/lib/mock/news";
import type { NewsEntry, PhotoTint } from "@/types";

/**
 * Placeholder frame art for CMS-driven entries (docs §11.4: placeholder-only
 * display fields belong to the UI layer, not the schema). The seeded sample
 * entries keep their mockup frames, keyed by the stable seed id; anything new
 * from the CMS falls back to a champagne/jade/emerald-free rotation of the
 * neutral tints with the entry title as the frame name.
 */
const NEWS_FRAME_BY_ID = new Map<string, NewsEntry["frame"]>(
  sampleNewsEntries.map((entry) => [entry.id, entry.frame]),
);

const FALLBACK_TINTS: PhotoTint[] = ["champagne", "sage", "rosegold", "iris"];

export function newsFrameFor(
  key: string,
  title: string,
  index: number,
): NewsEntry["frame"] {
  return (
    NEWS_FRAME_BY_ID.get(key) ?? {
      tint: FALLBACK_TINTS[index % FALLBACK_TINTS.length],
      kicker: "Photo",
      name: title,
    }
  );
}
