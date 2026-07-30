import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RichHeading } from "@/components/ui/RichHeading";
import { cn } from "@/lib/utils";

/**
 * The shared page head (docs §7 news pagehead proportions; booking.md §5.2,
 * §9.4): eyebrow, serif H1 through the RichHeading `*emphasis*` convention,
 * optional support line, standard reveals. Extracted from the news, book,
 * and account near-copies by the B3a ruling; output stays pixel identical
 * to the originals. An optional `back` link renders above the eyebrow with a
 * left chevron, for detail pages that carry a return affordance.
 */
export function PageHead({
  eyebrow,
  title,
  support,
  back,
}: {
  eyebrow: string;
  /** Single-string heading; `*word*` renders as the champagne italic em. */
  title: string;
  support?: string;
  /** Optional return affordance rendered above the eyebrow. */
  back?: { href: string; label: string };
}) {
  return (
    <div
      className={cn(
        "mx-auto max-w-[1360px] px-[6vw] pb-2",
        // A back link starts the head higher, so the title rides up with it.
        back
          ? "pt-[104px] max-[900px]:pt-[88px]"
          : "pt-[158px] max-[900px]:pt-[130px]",
      )}
    >
      {back && (
        <Reveal as="div" className="mb-4">
          <Link
            href={back.href}
            className="text-mist hover:text-ivory inline-flex min-h-[44px] items-center gap-2 text-[10.5px] font-medium tracking-[0.24em] uppercase transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="none"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 stroke-current"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {back.label}
          </Link>
        </Reveal>
      )}
      <Reveal as="div">
        <Eyebrow className="mb-[22px]">{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal
        as="h1"
        delay={100}
        className="[&_em]:text-champagne font-serif text-[clamp(2.4rem,5.4vw,4.2rem)] leading-[1.05] font-medium [&_em]:italic"
      >
        <RichHeading text={title} />
      </Reveal>
      {support && (
        <Reveal
          as="p"
          delay={200}
          className="text-mist mt-[18px] max-w-[560px] text-[14.5px]"
        >
          {support}
        </Reveal>
      )}
    </div>
  );
}
