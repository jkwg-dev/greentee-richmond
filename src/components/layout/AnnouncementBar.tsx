"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Announcement } from "@/types";

/** Session-scoped dismissal store; sessionStorage has no same-tab events. */
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function dismiss(key: string) {
  window.sessionStorage.setItem(key, "1");
  for (const listener of listeners) listener();
}

/**
 * Announcement bar (docs §4.2; no mockup, the spec is the reference): a slim
 * row beneath the header inside the fixed header stack, driven by the single
 * active banner promotion. Dismissal is per session, keyed by document id so
 * a new announcement reappears. Safe-area padded (§10); overlays the page, so
 * appearing or dismissing never shifts layout (§12 CLS).
 */
export function AnnouncementBar({
  announcement,
}: {
  announcement: Announcement;
}) {
  const storageKey = `announcement-dismissed:${announcement.id}`;
  const dismissed = useSyncExternalStore(
    subscribe,
    () => window.sessionStorage.getItem(storageKey) === "1",
    () => false,
  );

  if (dismissed) return null;

  return (
    <div
      className={cn(
        "border-champagne/[0.12] bg-noir/[0.72] flex items-center gap-4 border-b backdrop-blur-[14px]",
        "py-2 pl-[max(5vw,env(safe-area-inset-left))] pr-[max(5vw,env(safe-area-inset-right))]",
      )}
    >
      <p className="text-mist min-w-0 flex-1 truncate text-[12px] leading-[1.6]">
        <span className="text-champagne mr-3 text-[9.5px] font-medium tracking-[0.28em] uppercase">
          {announcement.title}
        </span>
        {announcement.summary}
        {announcement.link && (
          <Link
            href={announcement.link}
            className="text-champagne hover:text-champagne-bright ml-3 border-b border-current text-[11px] transition-colors"
          >
            Learn more
          </Link>
        )}
      </p>
      <button
        type="button"
        aria-label="Dismiss announcement"
        onClick={() => dismiss(storageKey)}
        className="text-mist hover:text-ivory -my-3 -mr-4 flex min-h-11 min-w-11 shrink-0 items-center justify-center text-[13px] leading-none transition-colors"
      >
        ×
      </button>
    </div>
  );
}
