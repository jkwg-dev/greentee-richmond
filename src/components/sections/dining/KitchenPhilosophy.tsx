import { Reveal } from "@/components/motion/Reveal";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { DINING_SLOT_TINTS } from "@/lib/tints";
import type { PhilosophyCard } from "@/types";
import { DiningHead } from "./DiningHead";

/**
 * Kitchen Philosophy (docs §8.3 story item 4, mockup `.phil`): three concept
 * cards, each a 16/11 pending frame over a serif title and one line.
 */
export function KitchenPhilosophy({ cards }: { cards: PhilosophyCard[] }) {
  return (
    <section className="dine-sec">
      <DiningHead eyebrow="Kitchen Philosophy" title="Three ideas, held *quietly*." />
      <div className="mt-12 grid grid-cols-3 gap-7 max-[900px]:grid-cols-1">
        {cards.map((card, index) => (
          <Reveal as="article" key={card.title} delay={index * 120}>
            <PhotoFrame
              tint={DINING_SLOT_TINTS[index % DINING_SLOT_TINTS.length]}
              label={{ kicker: "Concept image", name: card.title }}
              className="mb-5 aspect-[16/11]"
            />
            <h3 className="mb-2 font-serif text-[21px] font-medium">
              {card.title}
            </h3>
            <p className="text-mist max-w-[320px] text-[13px] leading-[1.9] max-[900px]:max-w-none">
              {card.line}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
