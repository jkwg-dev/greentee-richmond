import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";

/**
 * The live-mode signed-out gate (booking.md §10.4): one quiet panel where
 * the booking panel would sit. The head above and the notes band beneath
 * render as always; the route never redirects (it stays indexable). Both
 * buttons carry next=/book so auth lands back here.
 */
export function BookGate() {
  return (
    <Reveal as="div" className="max-w-[560px]">
      <p className="text-mist text-[14.5px] leading-[1.85]">
        Sign in to see open times and reserve your bay.
      </p>
      <div className="mt-9 flex flex-wrap items-center gap-4">
        <Button href="/account/sign-in?next=/book">Sign In</Button>
        <Button href="/account/sign-up?next=/book" variant="ghost">
          Create Account
        </Button>
      </div>
    </Reveal>
  );
}
