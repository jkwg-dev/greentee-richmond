import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { BookGate } from "@/components/sections/book/BookGate";
import { BookingNotes } from "@/components/sections/book/BookingNotes";
import { PageHead } from "@/components/ui/PageHead";
import { BookingPanel } from "@/components/sections/book/BookingPanel";
import { defaultPartySize, isBookingLive } from "@/lib/booking/config";
import { venueTodayIso } from "@/lib/booking/dates";
import { activeProvider } from "@/lib/booking/provider";
import { getUser } from "@/lib/supabase/server";
import { getSiteSettings } from "@/sanity/lib/queries";

/** The strip and the initial availability follow the venue's current day. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book a Bay",
  description:
    "Pick a date and party size to see open bays and times at GreenTee Richmond Center.",
};

const BookPageHead = () => (
  <PageHead
    eyebrow="Book a Bay"
    title="Choose your *time*."
    support="Pick a date and party size to see open bays and times."
  />
);

/**
 * /book (booking.md §5): the booking browse page on the fixture provider.
 * The server render awaits rooms, today's availability, and the settings
 * phone, so first paint is populated without a client fetch (§5.7).
 */
export default async function BookPage() {
  // Live mode gates browse behind the verified user check (booking.md
  // §10.4); fixture mode stays open. The gate is an inline panel, never a
  // redirect, so the route stays indexable in every mode.
  if (isBookingLive() && !(await getUser())) {
    return (
      <>
        <BookPageHead />
        <div className="mx-auto max-w-[1360px] px-[6vw] pt-[46px] pb-[110px]">
          <BookGate />
          <Reveal as="div" delay={100} className="mt-16">
            <BookingNotes />
          </Reveal>
        </div>
      </>
    );
  }

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
      <BookPageHead />
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
