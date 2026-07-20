import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { BookGate } from "@/components/sections/book/BookGate";
import { BookingNotes } from "@/components/sections/book/BookingNotes";
import { PageHead } from "@/components/ui/PageHead";
import { BookingPanel } from "@/components/sections/book/BookingPanel";
import { defaultPartySize, isBookingLive } from "@/lib/booking/config";
import { venueTodayIso } from "@/lib/booking/dates";
import { BookingAuthError } from "@/lib/booking/errors";
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
async function loadBookingData() {
  const today = venueTodayIso();
  const [rooms, availability, settings] = await Promise.all([
    activeProvider.getRooms(),
    activeProvider.getAvailability({
      date: today,
      partySize: defaultPartySize,
    }),
    getSiteSettings(),
  ]);
  return { today, rooms, availability, settings };
}

export default async function BookPage() {
  // Live mode requires a session before browse (booking.md §10.4 as amended
  // 2026-07-20): signed out goes straight to sign in, and the honored
  // next=/book lands the visitor back here after. Fixture mode stays open.
  if (isBookingLive() && !(await getUser())) {
    redirect("/account/sign-in?next=/book");
  }

  let data: Awaited<ReturnType<typeof loadBookingData>> | null = null;
  try {
    data = await loadBookingData();
  } catch (error) {
    if (!(error instanceof BookingAuthError)) throw error;
  }

  // §10.4 hardening: the vendor rejected a token the local session still
  // considers valid (clock skew, revocation, a forced 401 in QA). The
  // sign-in page bounces signed-in visitors straight back to next, so a
  // redirect would loop; this one case renders the inline gate instead.
  if (data === null) {
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

  const { today, rooms, availability, settings } = data;

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
