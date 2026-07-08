import { Fragment } from "react";

/**
 * S2c Concept marquee (docs §5.1, mockup `.marquee`). The zone concept names
 * loop between two hairlines. The track is rendered twice so the CSS translate
 * loops seamlessly; the animation stops under reduced motion (globals.css).
 * Decorative, so `aria-hidden`.
 */
export function ConceptMarquee({ items }: { items: string[] }) {
  const sequence = [...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {sequence.map((item, i) => (
          <Fragment key={i}>
            <span>{item}</span>
            <i>·</i>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
