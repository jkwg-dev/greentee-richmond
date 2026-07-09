"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { BOOK_A_BAY_HREF, diningSubNav, primaryNav } from "@/lib/site";

export type FullMenuProps = {
  onClose: () => void;
  /** On `/dining` the Dining item expands into two entries (docs §3.4). */
  isDining?: boolean;
};

/**
 * Mobile navigation overlay (docs §3.4, §9.1: motion owns the FullMenu). Mounted
 * only while open (via `AnimatePresence` in the header), so every open is a
 * fresh element that fades in reliably rather than reusing a CSS transition that
 * freezes on reopen. Dialog with a focus trap, Escape to close, and a body
 * scroll lock while mounted.
 */
export function FullMenu({ onClose, isDining = false }: FullMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
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
  }, [onClose]);

  const items = [{ label: "Home", href: "/" }, ...primaryNav];

  return (
    <motion.div
      ref={menuRef}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.4, ease: "easeInOut" }}
      className="bg-noir/95 fixed inset-0 z-[150] flex flex-col justify-center gap-11 px-[9vw] backdrop-blur-md"
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
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
                className="text-mist hover:text-jade-text font-serif text-[clamp(1.2rem,5vw,1.6rem)] leading-tight italic transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </span>
        )}
      </nav>

      <Button href={BOOK_A_BAY_HREF} onClick={onClose} className="self-start">
        Book a Bay
      </Button>
    </motion.div>
  );
}
