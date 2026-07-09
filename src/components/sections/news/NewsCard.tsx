import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { cn } from "@/lib/utils";
import { NEWS_CATEGORY_LABEL, type NewsEntry } from "@/types";

/**
 * A News & Offers grid card (mockup `.ncard`), shared by the home teaser (docs
 * §5.1 S4, no line) and the `/news` index (docs §7, with a line): pending photo
 * frame, "Category · Timing" meta, serif title, and an optional one-line
 * excerpt. Unlinked until `/news/[slug]` detail routes ship (docs §15.10).
 */
export function NewsCard({
  entry,
  showLine = false,
  className,
}: {
  entry: NewsEntry;
  showLine?: boolean;
  className?: string;
}) {
  return (
    <article className={className}>
      <PhotoFrame
        tint={entry.frame.tint}
        label={{ kicker: entry.frame.kicker, name: entry.frame.name }}
        className="mb-4 aspect-[16/10]"
      />
      <p className="text-champagne text-[9px] leading-[1.8] font-medium tracking-[0.28em] uppercase">
        {NEWS_CATEGORY_LABEL[entry.category]}{" "}
        <span className="text-mist tracking-[0.2em]">· {entry.timing}</span>
      </p>
      <h3
        className={cn(
          "mt-2 font-serif text-[20px] leading-[1.25] font-medium",
          showLine && "mb-1.5",
        )}
      >
        {entry.title}
      </h3>
      {showLine && entry.excerpt && (
        <p className="text-mist text-[12.5px] leading-[1.75]">{entry.excerpt}</p>
      )}
    </article>
  );
}
