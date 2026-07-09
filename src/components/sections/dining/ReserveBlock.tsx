import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { FactRows } from "@/components/ui/FactRows";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import type { RestaurantReserve } from "@/types";
import { DiningHead } from "./DiningHead";

/**
 * Reserve page body (docs §8.3, mockup `.res-grid`): contact rows (all
 * placeholders as mocked), the Book a Table CTA anchoring to the OpenTable
 * embed placeholder (§15.3), and the banquet crosslink.
 */
export function ReserveBlock({ reserve }: { reserve: RestaurantReserve }) {
  const rows = [
    { label: "Telephone", value: reserve.phone, detail: "Placeholder" },
    { label: "WeChat", value: reserve.wechat, detail: "Placeholder" },
    {
      label: "Hours",
      value: reserve.hours.join(" · "),
      detail: "Placeholder, daily",
    },
    {
      label: "Address",
      value: reserve.address.name,
      detail: reserve.address.line,
    },
  ];

  return (
    <section className="dine-sec">
      <div className="grid grid-cols-[1.05fr_1fr] items-center gap-[5vw] max-[900px]:grid-cols-1 max-[900px]:gap-11">
        <div>
          <DiningHead eyebrow="Reserve" title="A table *awaits*." />
          <Reveal as="div" delay={160}>
            <FactRows accent="jade" facts={rows} className="mt-[34px] mb-[38px]" />
          </Reveal>
          <Reveal as="div" delay={400} className="mt-2">
            <Button href={reserve.openTableUrl ?? "#reservations"}>
              Book a Table
            </Button>
          </Reveal>
          <Reveal as="div" delay={460}>
            <Link
              href="/dining/banquet"
              className="text-mist border-champagne/40 hover:text-ivory mt-[30px] inline-block border-b pb-1.5 text-[10px] leading-none font-medium tracking-[0.24em] uppercase transition-colors"
            >
              Planning a private event? Banquet & Private Dining
            </Link>
          </Reveal>
        </div>
        <Reveal as="div" delay={200} id="reservations">
          <PhotoFrame
            tint="jade"
            showMark
            label={{
              kicker: "OpenTable embed placeholder",
              name: "Online Reservations",
            }}
            className="aspect-[16/10]"
          />
        </Reveal>
      </div>
    </section>
  );
}
