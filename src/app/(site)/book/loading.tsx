import { LoadingScreen } from "@/components/ui/LoadingScreen";

/**
 * Route-level loader for /book (booking.md §5.1 spinner ruling): a centered
 * champagne spinner during the live availability fetch, so the Book a Bay
 * navigation shows a page-level loader rather than a frozen previous page. The
 * checkout subtree keeps its own copy-bearing loaders (checkout/loading.tsx,
 * checkout/callback/loading.tsx); only this availability route uses the spinner.
 */
export default function BookLoading() {
  return <LoadingScreen />;
}
