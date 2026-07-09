import { Reveal } from "@/components/motion/Reveal";

/**
 * In His Own Words (docs §8.3 chef item 4, mockup `.quote`): serif italic
 * quote on a jade wash behind a champagne rule, placeholder pending the chef
 * interview.
 */
export function ChefQuote({ quote }: { quote: string }) {
  return (
    <Reveal
      as="blockquote"
      delay={400}
      className="border-champagne from-jade/[0.18] to-75% mt-9 border-l bg-linear-to-r to-transparent px-[26px] py-[22px]"
    >
      <p className="text-ivory/[0.92] font-serif text-[clamp(1.25rem,2vw,1.6rem)] leading-[1.6] italic">
        {quote}
      </p>
      <cite className="text-mist mt-3.5 block text-[9px] leading-none font-medium tracking-[0.3em] uppercase not-italic">
        In His Own Words · Placeholder, replace with chef interview
      </cite>
    </Reveal>
  );
}
