import { PhotoFrame } from "@/components/ui/PhotoFrame";
import type { Room } from "@/types";

/**
 * A VIP / VVIP room card (docs §6.3, mockup `.room`). Rendered rooms show a tint
 * placeholder; pending rooms (VIP 14 and 15, all VVIP) show their designed
 * pending label rather than stock imagery (§6.4 note 3). Motif label is
 * champagne, not jade (§6.3). Unlinked until per-zone routes ship.
 */
export function RoomCard({ room }: { room: Room }) {
  return (
    <article>
      <PhotoFrame
        tint={room.tint ?? "champagne"}
        showMark={room.showMark}
        label={
          room.pending
            ? { kicker: room.pendingLabel ?? "Render pending" }
            : undefined
        }
        className="mb-3.5 aspect-[16/10]"
      />
      {room.motif && <p className="r-meta">{room.motif}</p>}
      <h3 className="r-name">{room.name}</h3>
      {room.line && <p className="r-line">{room.line}</p>}
    </article>
  );
}
