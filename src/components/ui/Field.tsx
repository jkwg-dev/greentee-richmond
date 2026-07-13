import { useId } from "react";
import { cn } from "@/lib/utils";

export type FieldProps = {
  label: string;
  /**
   * Error line beneath the input. Champagne by ruling (booking.md §9.6):
   * the palette has no red and gains none.
   */
  error?: string;
  /** Quiet guidance beneath the input (e.g. the sign up password microcopy); hidden while an error shows. */
  hint?: string;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "className">;

/**
 * The only text input primitive (booking.md §9.6): tracked mist label,
 * transparent input on a hairline border, champagne focus border (the global
 * focus-visible outline still applies for keyboard), autofill repainted to
 * noir-soft, and the champagne error line.
 */
export function Field({ label, error, hint, className, ...input }: FieldProps) {
  const id = useId();
  const describedBy =
    [error && `${id}-error`, hint && !error && `${id}-hint`]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="text-mist mb-3 block text-[9.5px] leading-none font-medium tracking-[0.28em] uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "border-hair text-ivory block min-h-[44px] w-full border bg-transparent px-4 py-[10px] text-[14px] transition-[border-color] duration-300",
          "focus:border-champagne",
          // WebKit paints autofilled inputs itself; an inset shadow covers
          // that with noir-soft and keeps the text ivory (booking.md §9.6).
          "autofill:[caret-color:var(--color-ivory)] autofill:[box-shadow:inset_0_0_0_1000px_var(--color-noir-soft)] autofill:[-webkit-text-fill-color:var(--color-ivory)]",
        )}
        {...input}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="text-mist mt-2 text-[11.5px]">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-champagne mt-2 text-[11.5px]">
          {error}
        </p>
      )}
    </div>
  );
}
