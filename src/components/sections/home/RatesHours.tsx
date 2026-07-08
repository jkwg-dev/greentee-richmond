import { Reveal } from "@/components/motion/Reveal";
import { StatCounter } from "@/components/motion/StatCounter";
import { Button } from "@/components/ui/Button";
import { BOOK_A_BAY_HREF } from "@/lib/site";
import type { RatesContent } from "@/types";
import { GameHead } from "./GameHead";

/** Column labels stay static UI (docs §11.4); the head copy comes from data. */
const RATES_TITLE = "Bays & Rooms";
const HOURS_TITLE = "Hours & Availability";

const columnTitleClass =
  "text-champagne mb-2 font-serif text-[17px] font-medium tracking-[0.05em] italic";

function PriceRow({
  name,
  detail,
  value,
  unit,
}: {
  name: string;
  detail: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="border-champagne/[0.12] flex items-baseline justify-between gap-6 border-t py-[19px]">
      <div className="min-w-0">
        <b className="text-ivory block text-[14px] font-normal">{name}</b>
        <small className="text-mist mt-[3px] block text-[11.5px] leading-[1.75]">
          {detail}
        </small>
      </div>
      <span className="text-ivory font-serif text-[20px] font-medium whitespace-nowrap">
        {value}
        {unit && (
          <small className="text-mist ml-[5px] text-[10.5px] font-normal tracking-[0.08em]">
            {unit}
          </small>
        )}
      </span>
    </div>
  );
}

/**
 * S3 Rates & Hours (docs §5.1, mockup `#rates`). Two-column rate/hour lists over
 * a champagne-hairline stats strip whose counters ease up on first view.
 */
export function RatesHours({ content }: { content: RatesContent }) {
  return (
    <section id="rates" className="relative px-[6vw] py-[130px] max-[900px]:py-24">
      <GameHead
        eyebrow={content.eyebrow}
        title={content.title}
        sub={content.sub}
      />

      <div className="grid grid-cols-2 items-start gap-[6vw] max-[900px]:grid-cols-1 max-[900px]:gap-11">
        <Reveal as="div" className="min-w-0">
          <h3 className={columnTitleClass}>{RATES_TITLE}</h3>
          {content.rateRows.map((row) => (
            <PriceRow
              key={row.name}
              name={row.name}
              detail={row.detail}
              value={row.price}
              unit={row.unit}
            />
          ))}
          <p className="border-champagne/[0.12] text-mist mt-[22px] border-t pt-[18px] text-[11.5px] leading-[1.9]">
            {content.footnote}
          </p>
        </Reveal>

        <Reveal as="div" delay={120} className="min-w-0">
          <h3 className={columnTitleClass}>{HOURS_TITLE}</h3>
          {content.hourRows.map((row) => (
            <PriceRow
              key={row.name}
              name={row.name}
              detail={row.detail}
              value={row.value}
            />
          ))}
          <div className="mt-7 flex flex-wrap gap-3.5">
            <Button href={BOOK_A_BAY_HREF}>Book a Bay</Button>
            <Button href={BOOK_A_BAY_HREF} variant="ghost">
              Plan a Private Room
            </Button>
          </div>
        </Reveal>
      </div>

      <div className="border-hair mt-20 grid grid-cols-4 gap-[30px] border-t pt-14 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
        {content.stats.map((stat, i) => (
          <Reveal key={stat.label} as="div" delay={i * 100}>
            <StatCounter
              value={stat.value}
              suffix={stat.suffix}
              className="text-champagne block font-serif text-[clamp(2.4rem,4.5vw,3.6rem)] leading-none font-medium"
            />
            <small className="text-mist mt-3 block text-[9.5px] leading-[1.6] font-medium tracking-[0.26em] uppercase">
              {stat.label}
            </small>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
