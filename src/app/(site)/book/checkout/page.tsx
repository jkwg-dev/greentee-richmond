import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutPayment } from "@/components/sections/checkout/CheckoutPayment";
import { isMockCheckoutEnabled } from "@/lib/booking/config";
import { BookingApiError } from "@/lib/booking/errors";
import { getReservation } from "@/lib/booking/reservations";
import { getUser } from "@/lib/supabase/server";

/**
 * The payment page (booking.md §6, §12.11). Session required in every mode,
 * noindex, out of the sitemap, force-dynamic. It needs a reservationId; without
 * one it returns to /book. The pending reservation is fetched server side for
 * the summary; the island reads the checkout status, opens the session, and
 * mounts the surface the session mode names (mock QA surface or Moneris slot).
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Secure checkout",
  robots: { index: false, follow: false },
};

function first(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const reservationId = first((await searchParams).reservationId);
  if (!reservationId) redirect("/book");

  // A session is required in every mode: the checkout is always somebody's, and
  // the relayed JWT is what the middleware checks ownership against.
  if (!(await getUser())) {
    redirect(
      `/account/sign-in?next=${encodeURIComponent(
        `/book/checkout?reservationId=${reservationId}`,
      )}`,
    );
  }

  let reservation;
  try {
    reservation = await getReservation(reservationId);
  } catch (error) {
    // A foreign or unknown id is a 404 upstream; fixture mode has no reservation
    // store. Either way the payment page has nothing to settle, so it returns to
    // the booking flow rather than showing an empty checkout.
    if (error instanceof BookingApiError) redirect("/book");
    throw error;
  }

  return (
    <CheckoutPayment
      reservation={reservation}
      mockEnabled={isMockCheckoutEnabled()}
    />
  );
}
