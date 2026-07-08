import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { NEWS_CATEGORY_LABEL, type NewsEntry } from "@/types";

/**
 * The featured (latest) News & Offers entry (docs §5.1 S4, mockup `.nfeat`): a
 * wide pending frame beside the meta, serif title, one line, and a "Read the
 * story" cue. Unlinked until detail routes ship (docs §15.10).
 */
export function NewsFeature({ entry }: { entry: NewsEntry }) {
  return (
    <div className="mb-16 grid grid-cols-[1.25fr_1fr] items-center gap-[4.5vw] max-[900px]:mb-[52px] max-[900px]:grid-cols-1 max-[900px]:gap-[26px]">
      <PhotoFrame
        tint={entry.frame.tint}
        label={{ kicker: entry.frame.kicker, name: entry.frame.name }}
        className="aspect-[16/9]"
      />
      <div>
        <p className="text-champagne text-[9px] leading-[1.8] font-medium tracking-[0.28em] uppercase">
          {NEWS_CATEGORY_LABEL[entry.category]}{" "}
          <span className="text-mist tracking-[0.2em]">
            · {entry.timing} · Featured
          </span>
        </p>
        <h3 className="mt-3 mb-[14px] font-serif text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.12] font-medium">
          {entry.title}
        </h3>
        <p className="text-mist max-w-[480px] text-[13.5px]">{entry.excerpt}</p>
        <span className="border-hair text-ivory mt-[26px] inline-block border-b pb-[7px] text-[9.5px] font-medium tracking-[0.28em] uppercase">
          Read the story
        </span>
      </div>
    </div>
  );
}
