import Link from "next/link";
import { cn } from "@/lib/utils";

export type CrystalJadeMarkProps = {
  /** Link target when interactive (the rail links to `/dining`); omit for a static lockup. */
  href?: string;
  /** The rail mark closes with a short champagne rule (mockup `.dr-mark::after`). */
  rule?: boolean;
  className?: string;
};

/**
 * "Crystal Jade" over "Palace" (docs §8.2, mockup `.dr-mark`). Heads the rail
 * on desktop and moves into each page hero below 1025px.
 */
export function CrystalJadeMark({
  href,
  rule = true,
  className,
}: CrystalJadeMarkProps) {
  const classes = cn(
    "flex flex-col leading-none",
    rule &&
      "after:mt-3.5 after:h-px after:w-[34px] after:bg-champagne after:opacity-70",
    className,
  );
  const lockup = (
    <>
      <span className="font-serif text-2xl font-semibold tracking-[0.02em]">
        Crystal Jade
      </span>
      <span className="text-jade-text mt-2 text-[8px] font-medium tracking-[0.5em] uppercase">
        Palace
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} aria-label="Crystal Jade Palace">
        {lockup}
      </Link>
    );
  }
  return <div className={classes}>{lockup}</div>;
}
