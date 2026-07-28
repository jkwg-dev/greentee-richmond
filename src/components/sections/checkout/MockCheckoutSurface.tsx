import { Button } from "@/components/ui/Button";

/**
 * The mock checkout completion surface (booking.md §6 leg 2, §12.11), the mock
 * branch's stand-in for the Moneris Checkout area. It renders only under the
 * `BOOKING_MOCK_CHECKOUT` flag and only when the session mode is `mock`; the
 * island gates both. It is visibly labelled as a QA tool.
 *
 * Its action simulates `payment_complete` and nothing more: it never decides the
 * outcome. The outcome comes from the server complete call and the polling
 * machine on the callback route, exactly as a real Moneris receipt would.
 */
export function MockCheckoutSurface({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="border-champagne/[0.14] border p-7">
      <p className="text-mist text-[9.5px] font-medium tracking-[0.28em] uppercase">
        QA checkout tool
      </p>
      <p className="text-mist mt-5 max-w-[420px] text-[13.5px] leading-[1.8]">
        Mock mode. This stands in for the Moneris checkout and simulates a
        completed payment without contacting Moneris. The final status still
        comes from the server, so the confirmation, decline, review, and timed
        out surfaces all remain reachable through the outcome switch.
      </p>
      <div className="mt-8">
        <Button variant="solid" onClick={onComplete}>
          Simulate Payment
        </Button>
      </div>
    </div>
  );
}
