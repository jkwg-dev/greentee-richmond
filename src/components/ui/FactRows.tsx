import { cn } from "@/lib/utils";

export type Fact = {
  label: string;
  value: React.ReactNode;
  /** Optional second line beneath the value. */
  detail?: string;
};

export type FactRowsProps = {
  facts: Fact[];
  className?: string;
};

/**
 * Label / value definition list used across zones and dining (docs §5.5 visit
 * rows, §6.2 zone facts, §8.3 private dining). Each row is a champagne-hairline
 * rule; the grid collapses to one column below 560px (docs §10).
 */
export function FactRows({ facts, className }: FactRowsProps) {
  return (
    <dl className={className}>
      {facts.map((fact) => (
        <div
          key={fact.label}
          className={cn(
            "border-champagne/[0.12] grid grid-cols-[130px_1fr] gap-5 border-t py-[18px]",
            "max-[560px]:grid-cols-1 max-[560px]:gap-1",
          )}
        >
          <dt className="text-mist text-[9.5px] leading-[2] font-medium tracking-[0.28em] uppercase">
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
