import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ReservationDetail } from "@/components/sections/account/ReservationDetail";
import { BookingApiError } from "@/lib/booking/errors";
import { getReservation } from "@/lib/booking/reservations";
import { getUser } from "@/lib/supabase/server";

/**
 * The read-only reservation detail (booking.md §12.10). Session required; the
 * data goes through the same server-only reservations module the handler uses,
 * which relays the JWT. The middleware checks ownership and answers 404 for a
 * reservation this user does not own, so a guessed id shows the standard
 * not-found, never another person's booking. Noindex, and absent from the
 * sitemap (the static route list carries only the v1 surfaces).
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Reservation",
  robots: { index: false, follow: false },
};

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getUser();
  if (!user) {
    redirect(
      `/account/sign-in?next=${encodeURIComponent(`/account/reservations/${id}`)}`,
    );
  }

  let reservation;
  try {
    reservation = await getReservation(id);
  } catch (error) {
    // A foreign or unknown id is a 404 upstream; anything else (fixture mode
    // has no reservation store, an upstream outage) is equally unviewable here,
    // so the route answers with its own not-found either way.
    if (error instanceof BookingApiError) notFound();
    throw error;
  }

  return <ReservationDetail reservation={reservation} />;
}
