import { cn } from "@/lib/utils";

export type EyebrowProps = {
  children: React.ReactNode;
  /** `start` shows a single lead-in hairline; `center` flanks with two. */
  align?: "start" | "center";
  className?: string;
};

/**
 * Tracked champagne label with a hairline lead-in (docs §2.2). Section eyebrows
 * are `start`; hero, manifesto, and outro eyebrows are `center` (docs §5).
 */
export function Eyebrow({
  children,
  align = "start",
  className,
}: EyebrowProps) {
  return (
    <p
      className={cn(
        "text-champagne flex items-center gap-3 text-[10px] leading-none font-medium tracking-[0.34em] uppercase",
        "before:h-px before:w-[34px] before:bg-current before:opacity-60",
        align === "center" &&
          "justify-center after:h-px after:w-[34px] after:bg-current after:opacity-60",
        className,
      )}
    >
      {children}
    </p>
  );
}
