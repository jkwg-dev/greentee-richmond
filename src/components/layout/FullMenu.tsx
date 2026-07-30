"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { BOOK_A_BAY_HREF, primaryNav, type NavLink } from "@/lib/site";
import { cn } from "@/lib/utils";

export type FullMenuProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Mobile navigation overlay (docs §3.4): dialog with a focus trap, Escape to
 * close, and a body scroll lock while open. Items are Home, the three primary
 * links, and the Book a Bay CTA.
 */
export function FullMenu({ open, onClose }: FullMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    if (!menu) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = menu.querySelectorAll<HTMLElement>("a[href], button");
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  const items: NavLink[] = [{ label: "Home", href: "/" }, ...primaryNav];

  return (
    <div
      ref={menuRef}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      aria-hidden={!open}
      className={cn(
        "bg-noir/95 fixed inset-0 z-[150] flex flex-col justify-center gap-11 px-[9vw] backdrop-blur-md transition-opacity duration-500",
        open ? "visible opacity-100" : "invisible opacity-0",
      )}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        className="text-mist hover:text-ivory absolute top-[26px] right-[5vw] p-3 text-[10px] font-medium tracking-[0.3em] uppercase transition-colors"
      >
        Close
      </button>

      <nav className="flex flex-col gap-3" aria-label="Primary">
        {items.map((item) => {
          const className =
            "hover:text-champagne font-serif text-[clamp(2rem,9vw,3rem)] leading-[1.3] font-medium transition-colors";
          if (item.external) {
            return (
              <a
                key={item.href + item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                tabIndex={open ? 0 : -1}
                className={className}
              >
                {item.label}
              </a>
            );
          }
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              onClick={onClose}
              tabIndex={open ? 0 : -1}
              className={className}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Utility area: the Book a Bay CTA plus the session-unaware Account
          link mirroring the desktop header (booking.md §10.5, §10.7). A text
          link here, not the header's icon: the menu has room and a lone glyph
          is harder to find. */}
      <div className="flex flex-wrap items-center gap-7">
        <Button href={BOOK_A_BAY_HREF} onClick={onClose} tabIndex={open ? 0 : -1}>
          Book a Bay
        </Button>
        <Link
          href="/account/sign-in"
          onClick={onClose}
          tabIndex={open ? 0 : -1}
          className="text-mist hover:text-ivory px-1 py-3 text-[10.5px] font-medium tracking-[0.24em] uppercase transition-colors"
        >
          Account
        </Link>
      </div>
    </div>
  );
}
