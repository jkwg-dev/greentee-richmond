import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { BookHead } from "@/components/sections/book/BookHead";
import { BookingNotes } from "@/components/sections/book/BookingNotes";
import { BookingPanel } from "@/components/sections/book/BookingPanel";
import { defaultPartySize } from "@/lib/booking/config";
import { venueTodayIso } from "@/lib/booking/dates";
import { activeProvider } from "@/lib/booking/provider";
import { getSiteSettings } from "@/sanity/lib/queries";

/** The strip and the initial availability follow the venue's current day. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book a Bay",
  description:
    "Pick a date and party size to see open bays and times at GreenTee Richmond Center.",
};

/**
 * /book (booking.md §5): the booking browse page on the fixture provider.
 * The server render awaits rooms, today's availability, and the settings
 * phone, so first paint is populated without a client fetch (§5.7).
 */
export default async function BookPage() {
  const today = venueTodayIso();
  const [rooms, availability, settings] = await Promise.all([
    activeProvider.getRooms(),
    activeProvider.getAvailability({
      date: today,
      partySize: defaultPartySize,
    }),
    getSiteSettings(),
  ]);

  return (
    <>
      <BookHead />
      <div className="mx-auto max-w-[1360px] px-[6vw] pt-[46px] pb-[110px]">
        <BookingPanel
          rooms={rooms}
          initialDate={today}
          initialAvailability={availability}
          phone={settings.phone}
        />
        <Reveal as="p" className="text-mist mt-16 text-[12px]">
          All times Pacific.
        </Reveal>
        <Reveal as="div" delay={100} className="mt-6">
          <BookingNotes />
        </Reveal>
      </div>
    </>
  );
}
