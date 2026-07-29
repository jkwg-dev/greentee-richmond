import { CheckoutLoading } from "@/components/sections/checkout/CheckoutLoading";

/**
 * Route-level loader for /book/checkout (booking.md §12.11), overriding the
 * parent /book loader so the payment route never flashes the availability
 * "Loading times." line. The heading matches the payment island's own opening
 * phase, so the server render and the island hand off without a copy change.
 */
export default function CheckoutLoadingRoute() {
  return <CheckoutLoading heading="Opening secure checkout." />;
}
