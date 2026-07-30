import type { Metadata } from "next";
import { DiningChips } from "@/components/sections/DiningChips";
import { DiningInfoStrip } from "@/components/sections/DiningInfoStrip";
import { DiningRail } from "@/components/sections/DiningRail";
import { BOOK_A_TABLE_HREF, getRestaurant, sitePages } from "@/lib/content";
import { cormorant, inter } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Crystal Jade Palace",
    template: "%s · Crystal Jade Palace",
  },
  description:
    "Cantonese fine dining at GreenTee Richmond Center. The first Crystal Jade Palace in North America, led by a Michelin-starred kitchen.",
};

/**
 * Site shell: every route renders inside the jade page wash with the sticky
 * rail (1025px and up) or the top chip bar (below), closed by the restaurant
 * details strip. There is no site header in this phase; the rail and chips
 * are the navigation, and the Crystal Jade mark carries the brand. Phase 2
 * replaces this pattern with a top nav.
 */
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const restaurant = await getRestaurant();
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        {/* Set the reduced-motion flag before paint so `html.rm` rules apply
            without a flash of animation. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('rm')}catch(e){}",
          }}
        />
        <div id="top" className="dine-bg pb-16">
          <DiningChips pages={sitePages} />
          <div className="dine-shell">
            <DiningRail pages={sitePages} bookHref={BOOK_A_TABLE_HREF} />
            <main className="dine-main">{children}</main>
          </div>
          <DiningInfoStrip restaurant={restaurant} />
        </div>
      </body>
    </html>
  );
}
