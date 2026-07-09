"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { diningPages } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Sticky chip bar beneath the header on `/dining` routes, 1024px and below
 * (docs §8.2, mockup `.dinechips`). The five page links on a blurred jade-noir
 * backdrop; the active chip is jade-text with a champagne underline. Active
 * state is route-driven; targets are 44px (docs §10).
 */
export function DiningChips() {
  const pathname = usePathname();

  return (
    <nav className="dinechips" aria-label="Crystal Jade Palace pages">
      {diningPages.map((page) => {
        const active = pathname === page.href;
        return (
          <Link
            key={page.href}
            href={page.href}
            aria-current={active ? "page" : undefined}
            className={cn("dc-link", active && "active")}
          >
            <span>{page.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
