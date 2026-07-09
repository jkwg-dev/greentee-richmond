import type { Metadata } from "next";
import { NewsIndex } from "@/components/sections/news/NewsIndex";
import { NewsIndexHead } from "@/components/sections/news/NewsIndexHead";
import { newsIndexEntries } from "@/lib/mock/news";

export const metadata: Metadata = {
  title: "News & Offers",
  description:
    "Leagues, seasonal offers, and news from GreenTee Richmond Center and Crystal Jade Palace.",
};

/**
 * News & Offers index (docs §7). A page head over a client-filtered featured
 * entry and card grid. Static data from the mock; CMS-driven in Phase 6.
 */
export default function NewsPage() {
  return (
    <>
      <NewsIndexHead />
      <NewsIndex entries={newsIndexEntries} />
    </>
  );
}
