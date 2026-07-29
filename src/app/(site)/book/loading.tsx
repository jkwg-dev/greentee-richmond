import { CheckoutLoading } from "@/components/sections/checkout/CheckoutLoading";

/**
 * Route-level loader for /book (booking.md §5.1): a full page quiet loader
 * during the live server fetch, so the Book a Bay navigation shows a loader
 * rather than a frozen previous page. The checkout subtree overrides this with
 * its own copy (checkout/loading.tsx, checkout/callback/loading.tsx), so this
 * "Loading times." line stays scoped to the availability page.
 */
export default function BookLoading() {
  return <CheckoutLoading heading="Loading times." />;
}
