import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";

/**
 * The auth desync gate (booking.md §10.4 as amended 2026-07-20): renders
 * only when the vendor rejects a token the local session still considers
 * valid; the plain signed-out case redirects to sign in before render. A
 * redirect here would loop through the sign-in page's signed-in bounce, so
 * this panel is the remedy surface. Both buttons carry next=/book so auth
 * lands back here.
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
