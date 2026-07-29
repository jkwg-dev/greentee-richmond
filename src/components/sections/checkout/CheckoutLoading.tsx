import { CheckoutShell } from "./CheckoutShell";

/**
 * The shared quiet loader for the /book and checkout route segments and the
 * payment island's opening phase (booking.md §5.1, §12.11): the checkout
 * eyebrow over one loading line and a single champagne hairline pulse, no
 * spinner motion. Each caller passes the heading its surface resolves into, so
 * a route loader reads the same line the island paints next and the two do not
 * flash different copy across the hand off.
 */
export function CheckoutLoading({ heading }: { heading: string }) {
  return (
    <div className="mx-auto max-w-[1360px] px-[6vw] pt-[158px] pb-[140px] max-[900px]:pt-[130px]">
      <CheckoutShell eyebrow="One moment" heading={heading}>
        <div
          aria-hidden="true"
          className="bg-champagne/30 mt-10 h-px w-[120px] motion-safe:animate-pulse"
        />
      </CheckoutShell>
    </div>
  );
}
