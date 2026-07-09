import { cn } from "@/lib/utils";

export type EyebrowProps = {
  children: React.ReactNode;
  /** `start` shows a single lead-in hairline; `center` flanks with two. */
  align?: "start" | "center";
  /**
   * `jade` is for Crystal Jade Palace content only (docs §2.1): jade-text label
   * with the champagne hairline kept (docs §8.1).
   */
  accent?: "champagne" | "jade";
  className?: string;
};

/**
 * Tracked champagne label with a hairline lead-in (docs §2.2). Section eyebrows
 * are `start`; hero, manifesto, and outro eyebrows are `center` (docs §5).
 */
export function Eyebrow({
  children,
  align = "start",
  accent = "champagne",
  className,
}: EyebrowProps) {
  return (
    <p
      className={cn(
        "text-champagne flex items-center gap-3 text-[10px] leading-none font-medium tracking-[0.34em] uppercase",
        "before:h-px before:w-[34px] before:bg-current before:opacity-60",
        align === "center" &&
          "justify-center after:h-px after:w-[34px] after:bg-current after:opacity-60",
        accent === "jade" &&
          "text-jade-text before:bg-champagne before:opacity-[0.85] after:bg-champagne after:opacity-[0.85]",
        className,
      )}
    >
      {children}
    </p>
  );
}
