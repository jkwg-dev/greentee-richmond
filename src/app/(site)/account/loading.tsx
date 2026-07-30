import { LoadingScreen } from "@/components/ui/LoadingScreen";

/**
 * Route-level loader for /account (booking.md §5.1 spinner ruling, §13). The
 * account page fetches the reservations and rooms server side before it can
 * render, so without this the page stayed blank until the fetch returned. The
 * spinner shows during that fetch and hands off to the populated page.
 */
export default function AccountLoading() {
  return <LoadingScreen />;
}
