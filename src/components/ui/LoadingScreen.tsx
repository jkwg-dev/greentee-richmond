import { Spinner } from "./Spinner";

/**
 * The full-page route loader (booking.md §5.1 spinner ruling): a centered
 * champagne spinner filling the page area beneath the header while a route's
 * server render is in flight. Used by the /book and /account `loading.tsx`
 * boundaries so navigation shows a loader instead of a blank or frozen page.
 */
export function LoadingScreen() {
  return (
    <div className="flex min-h-[80svh] items-center justify-center px-[6vw]">
      <Spinner />
    </div>
  );
}
