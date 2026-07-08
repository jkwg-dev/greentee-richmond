"use client";

import {
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type ElementType,
} from "react";
import { cn } from "@/lib/utils";

/**
 * Shared reveal observers, one per threshold (docs §9.2: "fired by a shared
 * IntersectionObserver"). Each element is observed once, then released.
 */
const registries = new Map<
  number,
  { io: IntersectionObserver; callbacks: Map<Element, () => void> }
>();

function observe(el: Element, threshold: number, onEnter: () => void) {
  let registry = registries.get(threshold);
  if (!registry) {
    const callbacks = new Map<Element, () => void>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const cb = callbacks.get(entry.target);
          if (cb) {
            cb();
            io.unobserve(entry.target);
            callbacks.delete(entry.target);
          }
        }
      },
      { threshold },
    );
    registry = { io, callbacks };
    registries.set(threshold, registry);
  }
  registry.callbacks.set(el, onEnter);
  registry.io.observe(el);
  return () => {
    registry.io.unobserve(el);
    registry.callbacks.delete(el);
  };
}

type RevealOwnProps<T extends ElementType> = {
  as?: T;
  /** Stagger, in milliseconds (mockup `data-delay`). */
  delay?: number;
  /** Visibility threshold: 0.16 on Home, 0.12 on `/spaces` (docs §9.2). */
  threshold?: number;
  className?: string;
  children?: React.ReactNode;
};

export type RevealProps<T extends ElementType> = RevealOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof RevealOwnProps<T>>;

/**
 * Opacity + rise entrance on the `[data-reveal]` system (docs §9.2). Polymorphic
 * so it decorates the real element (a heading, a paragraph) rather than wrapping
 * it in a div. Reduced motion and no-IO settle immediately.
 */
export function Reveal<T extends ElementType = "div">({
  as,
  delay = 0,
  threshold = 0.16,
  className,
  children,
  ...rest
}: RevealProps<T>) {
  const Component = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const settle = () => el.classList.add("in");
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced || !("IntersectionObserver" in window)) {
      settle();
      return;
    }

    return observe(el, threshold, () => {
      if (delay > 0) window.setTimeout(settle, delay);
      else settle();
    });
  }, [delay, threshold]);

  return (
    <Component ref={ref} data-reveal className={cn(className)} {...rest}>
      {children}
    </Component>
  );
}
