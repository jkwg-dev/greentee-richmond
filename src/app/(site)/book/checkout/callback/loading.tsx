import { CheckoutLoading } from "@/components/sections/checkout/CheckoutLoading";

/**
 * Route-level loader for the payment return route (booking.md §12.3),
 * overriding the checkout loader so a hard reload of the callback reads the
 * confirming line rather than "Opening secure checkout." The island then paints
 * the same confirming state, so the hand off does not change copy.
 */
export default function CheckoutCallbackLoadingRoute() {
  return <CheckoutLoading heading="Confirming your payment." />;
}
