"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { BOOK_A_BAY_HREF, diningSubNav, primaryNav } from "@/lib/site";
import { cn } from "@/lib/utils";

export type FullMenuProps = {
  open: boolean;
  onClose: () => void;
  /** On `/dining` the Dining item expands into two entries (docs §3.4). */
  isDining?: boolean;
};

/**
 * Mobile navigation overlay (docs §3.4): dialog with a focus trap, Escape to
 * close, and a body scroll lock while open. Items are Home, the three primary
 * links, and the Book a Bay CTA; Dining expands to its two entries on `/dining`.
 */
export function FullMenu({ open, onClose, isDining = false }: FullMenuProps) {
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

  const items = [{ label: "Home", href: "/" }, ...primaryNav];

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
        {items.map((item) => (
          <Link
            key={item.href + item.label}
            href={item.href}
            onClick={onClose}
            tabIndex={open ? 0 : -1}
            className="hover:text-champagne font-serif text-[clamp(2rem,9vw,3rem)] leading-[1.3] font-medium transition-colors"
          >
            {item.label}
          </Link>
        ))}
        {isDining && (
          <span className="mt-2 flex flex-col gap-2 pl-1">
            {diningSubNav.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={onClose}
                tabIndex={open ? 0 : -1}
                className="text-mist hover:text-jade-text font-serif text-[clamp(1.2rem,5vw,1.6rem)] leading-tight italic transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </span>
        )}
      </nav>

      <Button
        href={BOOK_A_BAY_HREF}
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        className="self-start"
      >
        Book a Bay
      </Button>
    </div>
  );
}
