import { cn } from "@/lib/utils";

export type EyebrowProps = {
  children: React.ReactNode;
  /** `start` shows a single lead-in hairline; `center` flanks with two. */
  align?: "start" | "center";
  /** `jade` renders a jade-text label with the champagne hairline kept. */
  accent?: "champagne" | "jade";
  className?: string;
};

/**
 * Tracked champagne label with a hairline lead-in. Section eyebrows are
 * `start`; hero eyebrows are `center` where the mockup centers them.
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
          "text-jade-text before:bg-champagne after:bg-champagne before:opacity-[0.85] after:opacity-[0.85]",
        className,
      )}
    >
      {children}
    </p>
  );
}
