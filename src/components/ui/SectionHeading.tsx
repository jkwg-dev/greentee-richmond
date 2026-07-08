import { cn } from "@/lib/utils";
import { Eyebrow } from "./Eyebrow";

export type SectionHeadingProps = {
  eyebrow: React.ReactNode;
  /** Heading text; pass an `<em>` for italic champagne emphasis (docs §1.4). */
  title: React.ReactNode;
  sub?: React.ReactNode;
  align?: "start" | "center";
  /** Semantic level. Defaults to `h2`; section heads on Home use `h2`. */
  as?: "h1" | "h2";
  className?: string;
  headingClassName?: string;
};

/**
 * Eyebrow + serif heading + optional support line (docs §5). The `<em>` inside
 * a title renders italic champagne per the display rule; callers supply it.
 */
export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "start",
  as: Heading = "h2",
  className,
  headingClassName,
}: SectionHeadingProps) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      <Eyebrow align={align}>{eyebrow}</Eyebrow>
      <Heading
        className={cn(
          "mt-6 font-serif text-[clamp(2.1rem,4.6vw,3.5rem)] leading-[1.1] font-medium tracking-[0.004em]",
          "[&_em]:text-champagne [&_em]:font-serif [&_em]:italic",
          headingClassName,
        )}
      >
        {title}
      </Heading>
      {sub && (
        <p
          className={cn(
            "text-mist mt-5 max-w-[560px] text-[14.5px]",
            align === "center" && "mx-auto",
          )}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
