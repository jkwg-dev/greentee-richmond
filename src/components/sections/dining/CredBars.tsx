import { Reveal } from "@/components/motion/Reveal";
import type { ChefAward } from "@/types";

/**
 * Placeholder line-art crests ported from the chef mockup, in award order:
 * star laurel (Michelin), trophy (World Championship), star wreath (Best
 * Restaurant). Replaced by official award assets when they arrive (§8.3).
 */
const CRESTS = [
  <path
    key="michelin-star"
    d="M32 21 34.23 29.55 44.36 29.98 37.23 35.7 39.64 44.52 32 39.5 24.36 44.52 26.77 35.7 19.64 29.98 29.77 29.55 Z"
  />,
  <path
    key="championship-star"
    d="M32 29 34.23 34.93 40.56 35.22 35.61 39.17 37.29 45.28 32 41.8 26.71 45.28 28.39 39.17 23.44 35.22 29.77 34.93 Z"
  />,
  <path
    key="best-restaurant-star"
    d="M32 21.5 34 26.75 39.61 27.03 35.23 30.55 36.7 35.97 32 32.9 27.3 35.97 28.77 30.55 24.39 27.03 30 26.75 Z"
  />,
];

const CREST_EXTRAS = [
  <g key="michelin-extra" opacity=".7">
    <line x1="42.75" y1="52.6" x2="40.75" y2="49.15" />
    <line x1="35.73" y1="55.17" x2="35.04" y2="51.23" />
    <line x1="28.27" y1="55.17" x2="28.96" y2="51.23" />
    <line x1="21.25" y1="52.6" x2="23.25" y2="49.15" />
  </g>,
  <g key="championship-extra">
    <path d="M25 4 H39 L35 15 H29 Z" />
    <line x1="32" y1="5" x2="32" y2="14" opacity=".7" />
  </g>,
  <g key="best-restaurant-extra">
    <g opacity=".85">
      <path d="M23 47 C18 44 15.5 39 15.5 33" />
      <path d="M41 47 C46 44 48.5 39 48.5 33" />
      <path d="M23 47 Q32 52 41 47" />
    </g>
    <ellipse cx="18.5" cy="43" rx="4.4" ry="1.8" transform="rotate(-38 18.5 43)" />
    <ellipse cx="16.3" cy="38" rx="4.4" ry="1.8" transform="rotate(-62 16.3 38)" />
    <ellipse cx="16" cy="32.5" rx="4.4" ry="1.8" transform="rotate(-84 16 32.5)" />
    <ellipse cx="45.5" cy="43" rx="4.4" ry="1.8" transform="rotate(38 45.5 43)" />
    <ellipse cx="47.7" cy="38" rx="4.4" ry="1.8" transform="rotate(62 47.7 38)" />
    <ellipse cx="48" cy="32.5" rx="4.4" ry="1.8" transform="rotate(84 48 32.5)" />
  </g>,
];

/** Ring pair shared by the first and third crests; the trophy has its own cup. */
const CREST_RINGS = [true, false, true];

function Crest({ index }: { index: number }) {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-champagne h-[58px] w-[58px] max-[560px]:h-11 max-[560px]:w-11"
    >
      {CREST_RINGS[index] ? (
        <>
          <circle cx="32" cy="34" r="27" />
          <circle cx="32" cy="34" r="23.5" opacity=".55" />
        </>
      ) : (
        <>
          <circle cx="32" cy="38" r="22" />
          <circle cx="32" cy="38" r="18.5" opacity=".55" />
        </>
      )}
      {CRESTS[index]}
      {CREST_EXTRAS[index]}
    </svg>
  );
}

/**
 * Credential rail (docs §8.3 chef item 2, mockup `.creds`): three
 * gold-gradient emblem bars, each an SVG line-art crest beside the award title
 * and its jade year line, closed by the placeholder note.
 */
export function CredBars({ awards }: { awards: ChefAward[] }) {
  return (
    <div className="mt-10 mb-2 flex flex-col gap-3.5">
      {awards.map((award, index) => (
        <Reveal
          as="div"
          key={award.title}
          delay={160 + index * 80}
          className="border-champagne/[0.42] from-champagne/[0.18] to-champagne/[0.04] to-72% grid grid-cols-[64px_1fr] items-center gap-[22px] border bg-linear-120 px-[22px] py-[18px] shadow-[inset_0_0_40px_rgba(0,0,0,0.25)] max-[560px]:grid-cols-[46px_1fr] max-[560px]:gap-4 max-[560px]:px-[18px] max-[560px]:py-4"
        >
          <Crest index={index % CRESTS.length} />
          <div>
            <h3 className="text-ivory font-serif text-lg leading-[1.3] font-medium max-[560px]:text-base">
              {award.title}
            </h3>
            <span className="text-jade-text mt-[7px] block text-[8.5px] leading-normal font-medium tracking-[0.28em] uppercase">
              {[award.detail, award.years].filter(Boolean).join(" · ")}
            </span>
          </div>
        </Reveal>
      ))}
      <p className="text-mist/60 mt-1 text-[8.5px] leading-[1.6] font-medium tracking-[0.22em] uppercase">
        Emblems are placeholders. Replace with official award assets.
      </p>
    </div>
  );
}
