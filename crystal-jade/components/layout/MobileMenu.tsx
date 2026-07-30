"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type RefObject } from "react";
import { CrystalJadeMark } from "@/components/sections/CrystalJadeMark";
import { ReservationCta } from "@/components/ui/ReservationCta";
import type { ReservationTarget } from "@/lib/reservations";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/types";

const FOCUSABLE = "a[href], button:not([disabled])";

/**
 * Full-screen menu below 1025px. A modal dialog: focus moves in on open and
 * cycles inside (Tab is trapped), Escape and route change close it, body
 * scroll locks while open, and focus returns to the header toggle on close.
 * The closed panel is `inert`, so its links never enter the tab order.
 * Entrance is an unhurried fade-and-rise with a per-link stagger; reduced
 * motion settles everything instantly via the `html.rm` rules.
 */
export function MobileMenu({
  id,
  open,
  pages,
  bookTarget,
  onClose,
  toggleRef,
}: {
  id: string;
  open: boolean;
  pages: NavLink[];
  bookTarget: ReservationTarget;
  onClose: () => void;
  toggleRef: RefObject<HTMLButtonElement | null>;
}) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  // Body scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Focus management: enter on open, trap Tab, close on Escape, restore to
  // the toggle on close.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const restoreTo = toggleRef.current;
    panel.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      restoreTo?.focus();
    };
  }, [open, onClose, toggleRef]);

  return (
    <div
      id={id}
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      inert={!open}
      className={cn("cj-drawer", open && "open")}
    >
      <div className="flex min-h-[66px] items-center justify-between">
        <CrystalJadeMark rule={false} size="sm" />
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="cjd-close"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      <nav
        aria-label="Crystal Jade Palace pages"
        className="mt-[9vh] flex flex-col"
      >
        {pages.map((page, index) => {
          const active = pathname === page.href;
          return (
            <Link
              key={page.href}
              href={page.href}
              aria-current={active ? "page" : undefined}
              onClick={onClose}
              className={cn("cjd-link", active && "active")}
              style={{
                transitionDelay: open ? `${120 + index * 70}ms` : "0ms",
              }}
            >
              {page.label}
            </Link>
          );
        })}
      </nav>

      <div
        className="cjd-foot mt-auto flex flex-wrap items-center justify-between gap-6 pb-2"
        style={{ transitionDelay: open ? "520ms" : "0ms" }}
      >
        <ReservationCta target={bookTarget} onClick={onClose} />
        <p className="text-mist/50 flex cursor-default gap-3 text-[9.5px] leading-none font-medium tracking-[0.16em]">
          <span className="text-champagne">EN</span>
          <span className="font-zh">中文</span>
        </p>
      </div>
    </div>
  );
}
