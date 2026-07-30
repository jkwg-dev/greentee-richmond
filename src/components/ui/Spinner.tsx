import { cn } from "@/lib/utils";

/**
 * The champagne loading spinner (booking.md §5.1 spinner ruling): a thin
 * rotating arc over a faint full-circle track, in the global accent. The whole
 * SVG rotates around its center; `motion-safe` gates the spin, so under reduced
 * motion the arc holds static and still reads as a partial ring. `role="status"`
 * with an accessible label announces the loading state; the SVG is decorative.
 */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("text-champagne inline-flex", className)}
    >
      <svg
        viewBox="0 0 50 50"
        aria-hidden="true"
        className="h-10 w-10 motion-safe:animate-spin"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="2"
          className="stroke-current opacity-20"
        />
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="31 126"
          className="stroke-current"
        />
      </svg>
    </span>
  );
}
