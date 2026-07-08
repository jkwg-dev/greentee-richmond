import type { Zone } from "@/types";

/**
 * Prev / next zone pager (docs §6.2, mockup `.znav`). The mockup defines the
 * style but omits the element; it is built here per spec. Ends render an empty
 * cell so the two-column rule stays intact. Stacks to one column below 560px.
 */
export function ZonePager({ prev, next }: { prev?: Zone; next?: Zone }) {
  return (
    <nav className="znav" aria-label="Zone pager">
      {prev ? (
        <a href={`#${prev.slug}`} className="znav-cell">
          <small>Previous</small>
          <span className="znav-name">{prev.name}</span>
        </a>
      ) : (
        <span className="znav-cell" aria-hidden="true" />
      )}
      {next ? (
        <a href={`#${next.slug}`} className="znav-cell">
          <small>Next</small>
          <span className="znav-name">{next.name}</span>
        </a>
      ) : (
        <span className="znav-cell" aria-hidden="true" />
      )}
    </nav>
  );
}
