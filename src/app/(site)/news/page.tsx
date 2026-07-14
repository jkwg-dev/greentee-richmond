import type { Metadata } from "next";
import { NewsIndex } from "@/components/sections/news/NewsIndex";
import { PageHead } from "@/components/ui/PageHead";
import { getNewsEntries } from "@/sanity/lib/queries";

export const metadata: Metadata = {
  title: "News & Offers",
  description:
    "Leagues, seasonal offers, and news from GreenTee Richmond Center and Crystal Jade Palace.",
};

/**
 * News & Offers index (docs §7): the promotion/event/newsPost union from
 * Sanity (§4.1), newest first, over the client-filtered featured entry and
 * card grid. An empty CMS renders the head, the filter bar, and the quiet
 * empty state.
 */
export default async function NewsPage() {
  const entries = await getNewsEntries();
  return (
    <>
      {/* The mockup sub ends "Every entry below is managed in Sanity."; that
          is a dev note, not user copy, so it stays dropped (docs §7 note). */}
      <PageHead
        eyebrow="News & Offers"
        title="What's on at the Center."
        support="Leagues, seasonal offers, and news from the club and Crystal Jade Palace."
      />
      <NewsIndex entries={entries} />
    </>
  );
}
