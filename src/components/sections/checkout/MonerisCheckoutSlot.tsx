import { Button } from "@/components/ui/Button";
import { CheckoutShell } from "./CheckoutShell";

/**
 * The single boundary where B3c-2b mounts the Moneris Checkout SDK (booking.md
 * §6, §12.11). B3c-2a leaves it deliberately empty of any SDK: no script
 * injection, no callback registration, no Moneris host or mode string lives
 * here. Reaching this slot means the session mapped to `moneris` (a `qa` or
 * `production` environment), which the local stub never returns, so in this
 * phase it renders the generic error surface in place of the checkout area.
 *
 * When the SDK lands, its container element and the five callback registrations
 * replace the error surface below; nothing else on the payment page changes.
 */
export function MonerisCheckoutSlot({ onRetry }: { onRetry: () => void }) {
  return (
    <CheckoutShell
      eyebrow="One moment"
      heading="Something went wrong. Please try again."
    >
      <div className="mt-10">
        <Button variant="ghost" onClick={onRetry}>
          Try Again
        </Button>
      </div>
    </CheckoutShell>
  );
}
