"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/types";

/**
 * Sticky chip bar at the viewport top, 1024px and below (mockup
 * `.dinechips`). The five page links on a blurred jade-noir backdrop; the
 * active chip is jade-text with a champagne underline. Active state is
 * route-driven; targets are 44px. Nav data arrives via props from the
 * layout, which reads it from `lib/content.ts`.
 */
export function DiningChips({ pages }: { pages: NavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="dinechips" aria-label="Crystal Jade Palace pages">
      {pages.map((page) => {
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
