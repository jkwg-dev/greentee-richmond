import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutCallback } from "@/components/sections/checkout/CheckoutCallback";
import { getUser } from "@/lib/supabase/server";
import { getSiteSettings } from "@/sanity/lib/queries";

/**
 * The payment return route (booking.md §12.3), recorded as
 * `/book/checkout/callback`. A session is required; the page opens in the
 * neutral confirming state and never a success state, because the browser
 * callback is not proof of payment. Verification happens server to server
 * through our own handler, in the island below.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confirming your payment",
  robots: { index: false, follow: false },
};

function first(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function CheckoutCallbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const reservationId = first(params.reservationId);

  // The `next` carries the reservation only: a ticket does not belong in a
  // redirect chain, and the tab's own copy survives the sign-in round trip.
  if (!(await getUser())) {
    const next = reservationId
      ? `/book/checkout/callback?reservationId=${encodeURIComponent(reservationId)}`
      : "/book/checkout/callback";
    redirect(`/account/sign-in?next=${encodeURIComponent(next)}`);
  }

  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-[1360px] px-[6vw] pt-[158px] pb-[140px] max-[900px]:pt-[130px]">
      <CheckoutCallback
        reservationId={reservationId}
        urlTicket={first(params.ticket)}
        phone={settings.phone}
      />
    </div>
  );
}
