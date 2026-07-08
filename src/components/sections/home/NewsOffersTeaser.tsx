import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import type { NewsEntry, NewsTeaserHead } from "@/types";
import { GameHead } from "./GameHead";
import { NewsCard } from "./NewsCard";
import { NewsFeature } from "./NewsFeature";

/**
 * S4 News & Offers teaser (docs §5.1, §4.2, mockup `#news`). The latest entry as
 * a featured preview plus a three-card row and a "View More" link. Renders
 * nothing when there are no entries (empty state); toggle `NEWS_TEASER_EMPTY` in
 * the mock to prove it.
 */
export function NewsOffersTeaser({
  head,
  entries,
}: {
  head: NewsTeaserHead;
  entries: NewsEntry[];
}) {
  if (entries.length === 0) return null;

  const [featured, ...rest] = entries;
  const cards = rest.slice(0, 3);

  return (
    <section id="news" className="px-[6vw] py-[130px] max-[900px]:py-24">
      <GameHead {...head} />

      <Reveal as="div">
        <NewsFeature entry={featured} />
      </Reveal>

      <div className="grid grid-cols-3 gap-x-[26px] gap-y-11 max-[900px]:grid-cols-1 max-[900px]:gap-[34px]">
        {cards.map((entry, i) => (
          <Reveal key={entry.id} as="div" delay={i * 80}>
            <NewsCard entry={entry} />
          </Reveal>
        ))}
      </div>

      <Reveal as="div" className="flex justify-center pt-[60px]">
        <Button href="/news" variant="ghost">
          View More
        </Button>
      </Reveal>
    </section>
  );
}
