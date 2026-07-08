import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { NEWS_CATEGORY_LABEL, type NewsEntry } from "@/types";

/**
 * A News & Offers grid card (docs §5.1 S4, mockup `.ncard`): pending photo
 * frame, "Category · Timing" meta, and a serif title. Rendered unlinked until
 * `/news/[slug]` detail routes ship (docs §15.10).
 */
export function NewsCard({ entry }: { entry: NewsEntry }) {
  return (
    <article>
      <PhotoFrame
        tint={entry.frame.tint}
        label={{ kicker: entry.frame.kicker, name: entry.frame.name }}
        className="mb-4 aspect-[16/10]"
      />
      <p className="text-champagne text-[9px] leading-[1.8] font-medium tracking-[0.28em] uppercase">
        {NEWS_CATEGORY_LABEL[entry.category]}{" "}
        <span className="text-mist tracking-[0.2em]">· {entry.timing}</span>
      </p>
      <h3 className="mt-2 font-serif text-[20px] leading-[1.25] font-medium">
        {entry.title}
      </h3>
    </article>
  );
}
