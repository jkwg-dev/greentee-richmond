import Link from "next/link";

/**
 * Placeholder home. The real S0 to S9 Home port lands in Phase 2; for now this
 * points at the design-system demo so the app has a valid root route.
 */
export default function HomePlaceholder() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-[6vw] text-center">
      <p className="text-champagne flex items-center gap-3 text-[10px] font-medium tracking-[0.34em] uppercase before:h-px before:w-[34px] before:bg-current before:opacity-60">
        GreenTee Richmond Center
      </p>
      <h1 className="font-serif text-[clamp(2.4rem,6vw,4rem)] leading-[1.05] font-medium">
        Design system online.
      </h1>
      <p className="text-mist max-w-[460px] text-[14.5px]">
        Phases 0 and 1 are in place. The Home port begins in Phase 2.
      </p>
      <Link
        href="/styleguide"
        className="border-hair text-ivory hover:border-champagne hover:text-champagne border-b pb-2 text-[10px] font-medium tracking-[0.26em] uppercase transition-colors"
      >
        View the styleguide
      </Link>
    </main>
  );
}
