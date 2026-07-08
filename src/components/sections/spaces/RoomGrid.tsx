import { Fragment } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import type { Room, RoomMotif } from "@/types";
import { RoomCard } from "./RoomCard";

/**
 * The VIP/VVIP room grid (docs §6.3, mockup `.rooms`). Optional heading and
 * motif legend head the VIP grid; the VVIP grid has neither. Three columns,
 * two below 900px, one below 560px. Motif legend is champagne, not jade (§6.3).
 */
export function RoomGrid({
  rooms,
  heading,
  motifLegend,
}: {
  rooms: Room[];
  heading?: string;
  motifLegend?: RoomMotif[];
}) {
  const hasHead = Boolean(heading || motifLegend);
  return (
    <div>
      {hasHead && (
        <Reveal
          as="div"
          threshold={0.12}
          className="mt-20 mb-2 flex flex-wrap items-baseline justify-between gap-5"
        >
          {heading && (
            <h2 className="font-serif text-[clamp(1.6rem,2.6vw,2.2rem)] font-medium">
              {heading}
            </h2>
          )}
          {motifLegend && (
            <p className="text-mist text-[9px] font-medium tracking-[0.3em] uppercase">
              {motifLegend.map((motif, i) => (
                <Fragment key={motif}>
                  {i > 0 && " · "}
                  <b className="text-champagne font-medium">{motif}</b>
                </Fragment>
              ))}
            </p>
          )}
        </Reveal>
      )}
      <div
        className={cn(
          "grid grid-cols-3 gap-6 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1",
          hasHead ? "mt-[34px]" : "mt-[70px]",
        )}
      >
        {rooms.map((room) => (
          <Reveal key={room.name} as="div" threshold={0.12}>
            <RoomCard room={room} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
