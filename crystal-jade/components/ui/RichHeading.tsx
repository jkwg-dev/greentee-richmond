import { Fragment } from "react";

/**
 * Renders a single-string heading field with two light conventions: `\n`
 * becomes a line break, and `*word*` becomes an `<em>` for the italic
 * champagne emphasis. The `<em>` styling comes from the parent heading's
 * `[&_em]` classes; this only produces the structure.
 */
export function RichHeading({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, lineIndex) => (
        <Fragment key={lineIndex}>
          {line
            .split(/(\*[^*]+\*)/g)
            .map((part, partIndex) =>
              part.length > 2 && part.startsWith("*") && part.endsWith("*") ? (
                <em key={partIndex}>{part.slice(1, -1)}</em>
              ) : (
                <Fragment key={partIndex}>{part}</Fragment>
              ),
            )}
          {lineIndex < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  );
}
