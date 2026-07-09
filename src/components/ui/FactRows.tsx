import { cn } from "@/lib/utils";

export type Fact = {
  label: string;
  value: React.ReactNode;
  /** Optional second line beneath the value. */
  detail?: string;
};

export type FactRowsProps = {
  facts: Fact[];
  /** When false, the first row drops its top rule and top padding (docs §6.2 zones). */
  firstRule?: boolean;
  /**
   * `jade` is for Crystal Jade Palace content only (docs §2.1): jade rules and
   * jade-text labels on a wider label column (mockup `.rows`, docs §8.3).
   */
  accent?: "champagne" | "jade";
  className?: string;
};

/**
 * Label / value definition list used across zones and dining (docs §5.5 visit
 * rows, §6.2 zone facts, §8.3 private dining). Each row is a champagne-hairline
 * rule; the grid collapses to one column below 560px (docs §10).
 */
export function FactRows({
  facts,
  firstRule = true,
  accent = "champagne",
  className,
}: FactRowsProps) {
  return (
    <dl className={className}>
      {facts.map((fact) => (
        <div
          key={fact.label}
          className={cn(
            "border-champagne/[0.12] grid grid-cols-[130px_1fr] gap-5 border-t py-[18px]",
            "max-[560px]:grid-cols-1 max-[560px]:gap-1",
            accent === "jade" &&
              "border-jade/40 grid-cols-[160px_1fr] py-4",
            !firstRule && "first:border-t-0 first:pt-0",
          )}
        >
          <dt
            className={cn(
              "text-mist text-[9.5px] leading-[2] font-medium tracking-[0.28em] uppercase",
              accent === "jade" && "text-jade-text",
            )}
          >
            {fact.label}
          </dt>
          <dd className="text-ivory text-[14px]">
            {fact.value}
            {fact.detail && (
              <small className="text-mist mt-0.5 block text-[11.5px]">
                {fact.detail}
              </small>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
