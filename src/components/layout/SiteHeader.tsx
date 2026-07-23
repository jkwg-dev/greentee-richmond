"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { BOOK_A_BAY_HREF, primaryNav } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { Announcement } from "@/types";
import { AnnouncementBar } from "./AnnouncementBar";
import { BrandMark } from "./BrandMark";
import { FullMenu } from "./FullMenu";

/**
 * Fixed site header (docs §3.4): brand mark, the three primary links, and a
 * persistent Book a Bay CTA. Gains a translucent `scrolled` treatment past 40px
 * and collapses to a hamburger with the FullMenu overlay below 900px. The
 * announcement bar (docs §4.2) rides the same fixed stack so it sits beneath
 * the header at every scroll state.
 */
export function SiteHeader({
  announcement = null,
}: {
  announcement?: Announcement | null;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isDining = pathname?.startsWith("/dining") ?? false;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* One fixed stack so the announcement bar sits beneath the header at
          every scroll state (docs §4.2). */}
      <div className="fixed inset-x-0 top-0 z-[100]">
        <header
          className={cn(
            "flex items-center justify-between border-b px-[5vw] transition-[background-color,border-color,padding] duration-500",
            scrolled
              ? "border-champagne/[0.12] bg-noir/[0.72] py-[14px] backdrop-blur-[14px]"
              : "border-transparent py-[22px]",
          )}
        >
          <BrandMark href="/" />

          <nav
            aria-label="Primary"
            className="flex items-center gap-8 max-[900px]:hidden"
          >
            {primaryNav.map((link) => {
              const isActive =
                !!pathname &&
                (pathname === link.href ||
                  pathname.startsWith(link.href + "/"));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "after:bg-champagne relative text-[10.5px] font-medium tracking-[0.24em] uppercase transition-colors after:absolute after:-bottom-[7px] after:left-0 after:h-px after:w-full after:transition-transform after:duration-[450ms] after:ease-[cubic-bezier(0.22,1,0.36,1)]",
                    isActive
                      ? "text-ivory after:origin-left after:scale-x-100"
                      : "text-mist hover:text-ivory after:origin-right after:scale-x-0 hover:after:origin-left hover:after:scale-x-100",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            {/* Account icon (booking.md §10.5, §10.7): a person glyph in the
                nav-item treatment, mist to ivory on hover, 44px hit area from
                padding. Static href by design; the header stays session
                unaware, and B2's signed-in redirect makes the destination
                correct in both states. aria-label and title because a lone
                glyph is invisible to assistive technology. */}
            <Link
              href="/account/sign-in"
              aria-label="Account"
              title="Account"
              className="text-mist hover:text-ivory mr-3 flex items-center p-3 transition-colors max-[900px]:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                strokeWidth={1.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 stroke-current"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
            <Button href={BOOK_A_BAY_HREF} size="sm">
              Book a Bay
            </Button>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="hidden flex-col justify-center gap-1.5 px-2.5 py-3 max-[900px]:flex"
            >
              <span className="bg-ivory h-[1.5px] w-[26px]" />
              <span className="bg-ivory h-[1.5px] w-[26px]" />
            </button>
          </div>
        </header>

        {announcement && <AnnouncementBar announcement={announcement} />}
      </div>

      <FullMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        isDining={isDining}
      />
    </>
  );
}
