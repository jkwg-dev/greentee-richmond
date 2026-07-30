import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { DiningInfoStrip } from "@/components/sections/DiningInfoStrip";
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
 * Site shell: skip link, the sticky top header (hamburger menu at 1024px and
 * below), the jade page wash around a single centered content column, and
 * the restaurant details strip closing the page.
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
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        <div id="top" className="dine-bg pb-16">
          <SiteHeader pages={sitePages} bookHref={BOOK_A_TABLE_HREF} />
          <div className="dine-shell">
            <main id="content" tabIndex={-1} className="dine-main outline-none">
              {children}
            </main>
          </div>
          <DiningInfoStrip restaurant={restaurant} />
        </div>
      </body>
    </html>
  );
}
