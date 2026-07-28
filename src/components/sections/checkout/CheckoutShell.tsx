import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * The shared surface wrapper for the checkout flow (booking.md §12.4, §12.6,
 * §12.11): a tracked eyebrow over a serif heading, with room for an action
 * beneath. Presentational only. Shared by the payment page and the callback
 * outcomes so every checkout surface reads the same.
 */
export function CheckoutShell({
  eyebrow,
  heading,
  children,
}: {
  eyebrow: string;
  heading: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="max-w-[620px]">
      <Eyebrow className="mb-[22px]">{eyebrow}</Eyebrow>
      <h1 className="text-ivory font-serif text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.15] font-medium">
        {heading}
      </h1>
      {children}
    </div>
  );
}
