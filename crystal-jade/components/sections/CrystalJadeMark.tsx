import Link from "next/link";
import { cn } from "@/lib/utils";

export type CrystalJadeMarkProps = {
  /** Link target when interactive (the header links home); omit for a static lockup. */
  href?: string;
  /** Close the lockup with a short champagne rule (mockup `.dr-mark::after`). */
  rule?: boolean;
  /** `sm` is the header-scale lockup; `default` serves hero-scale placements. */
  size?: "default" | "sm";
  className?: string;
};

/**
 * "Crystal Jade" over "Palace" (mockup `.dr-mark`). Carries the brand in the
 * site header and the mobile menu.
 */
export function CrystalJadeMark({
  href,
  rule = true,
  size = "default",
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
      <span
        className={cn(
          "font-serif font-semibold tracking-[0.02em]",
          size === "sm" ? "text-[19px]" : "text-2xl",
        )}
      >
        Crystal Jade
      </span>
      <span
        className={cn(
          "text-jade-text font-medium uppercase",
          size === "sm"
            ? "mt-1.5 text-[7px] tracking-[0.44em]"
            : "mt-2 text-[8px] tracking-[0.5em]",
        )}
      >
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
