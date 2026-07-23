import type { User } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { ProfileForm } from "@/components/sections/account/ProfileForm";
import { ReservationsList } from "@/components/sections/account/ReservationsList";
import { Button } from "@/components/ui/Button";
import { FactRows, type Fact } from "@/components/ui/FactRows";
import { PageHead } from "@/components/ui/PageHead";
import { isBookingLive } from "@/lib/booking/config";
import { listReservations } from "@/lib/booking/reservations";
import { getUser } from "@/lib/supabase/server";
import type { ReservationList } from "@/types/booking";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: "Your Account",
  robots: { index: false, follow: false },
};

type MetadataKey = "first_name" | "last_name" | "display_name" | "phone";

/**
 * `user_metadata` is an open record upstream; read the §9.4 keys as strings
 * and treat anything else as absent.
 */
function metadataString(user: User, key: MetadataKey): string {
  const value: unknown = user.user_metadata?.[key];
  return typeof value === "string" ? value.trim() : "";
}

/**
 * The account home (booking.md §13.1): profile on the left, reservations on the
 * right at 1024 and up, stacked below. The first page of reservations is
 * fetched server side so the list paints populated; the island loads further
 * pages on demand. In fixture mode there is no reservation store, so the list
 * is an honest empty. A live-mode fetch failure hands the island `null`, which
 * opens the list pane in its error state without touching the profile pane.
 */
async function loadReservations(): Promise<ReservationList | null> {
  if (!isBookingLive()) return { items: [], nextCursor: null };
  try {
    return await listReservations();
  } catch {
    return null;
  }
}

export default async function AccountPage() {
  const user = await getUser();
  if (!user) redirect("/account/sign-in?next=/account");

  const firstName = metadataString(user, "first_name");
  const lastName = metadataString(user, "last_name");
  const phone = metadataString(user, "phone");
  // The read-only row prefers the stored display_name, which is what the app
  // shows. An account from the earlier single-field build has it without the
  // parts; that account's form opens empty and heals on the first save.
  const shownName =
    metadataString(user, "display_name") || `${firstName} ${lastName}`.trim();
  const facts: Fact[] = [
    { label: "Email", value: user.email ?? "" },
    ...(shownName ? [{ label: "Name", value: shownName }] : []),
  ];

  const initialReservations = await loadReservations();

  return (
    <>
      <PageHead eyebrow="Your Account" title="Your account." />
      <div className="mx-auto max-w-[1360px] px-[6vw] pt-[46px] pb-[110px]">
        <div className="grid grid-cols-[340px_minmax(0,1fr)] items-start gap-[clamp(2rem,4vw,4rem)] max-[1023px]:grid-cols-1 max-[1023px]:gap-16">
          <Reveal as="div" delay={120}>
            <FactRows facts={facts} />
            <div className="mt-12">
              <ProfileForm
                firstName={firstName}
                lastName={lastName}
                phone={phone}
              />
            </div>
            <form action={signOut} className="mt-12">
              <Button type="submit" variant="ghost">
                Sign Out
              </Button>
            </form>
          </Reveal>

          <Reveal as="div" delay={200}>
            <ReservationsList initial={initialReservations} />
          </Reveal>
        </div>
      </div>
    </>
  );
}
