"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { BOOK_A_TABLE_HREF, diningPages } from "@/lib/site";
import { cn } from "@/lib/utils";
import { CrystalJadeMark } from "./CrystalJadeMark";

/**
 * Sticky left rail on `/dining` routes, 1025px and up (docs §8.2, mockup
 * `.dinerail`). Crystal Jade mark, the five page links with a route-driven
 * active state (jade-text plus a short gold dash), the Book a Table CTA, and
 * the static EN / 中文 indicator (Chinese pending human translation, §15.4).
 */
export function DiningRail() {
  const pathname = usePathname();

  return (
    <aside className="dinerail" aria-label="Crystal Jade Palace pages">
      <CrystalJadeMark href="/dining" />

      <nav className="flex flex-col gap-0.5">
        {diningPages.map((page) => {
          const active = pathname === page.href;
          return (
            <Link
              key={page.href}
              href={page.href}
              aria-current={active ? "page" : undefined}
              className={cn("dr-link", active && "active")}
            >
              {page.label}
            </Link>
          );
        })}
      </nav>

      <Button href={BOOK_A_TABLE_HREF} size="sm" className="self-start">
        Book a Table
      </Button>

      <p className="text-mist/50 flex cursor-default gap-3 text-[9.5px] leading-none font-medium tracking-[0.16em]">
        <span className="text-champagne">EN</span>
        <span className="font-zh">中文</span>
      </p>
    </aside>
  );
}
