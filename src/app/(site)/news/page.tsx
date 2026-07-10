import type { Metadata } from "next";
import { NewsIndex } from "@/components/sections/news/NewsIndex";
import { NewsIndexHead } from "@/components/sections/news/NewsIndexHead";
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
      <NewsIndexHead />
      <NewsIndex entries={entries} />
    </>
  );
}
