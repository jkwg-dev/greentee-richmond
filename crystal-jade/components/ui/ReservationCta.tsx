import { Button } from "./Button";
import type { ReservationTarget } from "@/lib/reservations";

export type ReservationCtaProps = {
  /** Resolved by `lib/reservations` in a Server Component, passed down. */
  target: ReservationTarget;
  variant?: "solid" | "ghost" | "light";
  size?: "default" | "sm";
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  children?: React.ReactNode;
};

/**
 * The single reservation call to action (header, menu, section CTAs, the
 * reserve page). Provider-blind: it renders whatever target was resolved
 * through `lib/reservations` and never decides where reservations go.
 */
export function ReservationCta({
  target,
  variant,
  size,
  className,
  onClick,
  children,
}: ReservationCtaProps) {
  return (
    <Button
      href={target.href}
      variant={variant}
      size={size}
      className={className}
      onClick={onClick}
      {...(target.external && { target: "_blank", rel: "noopener noreferrer" })}
    >
      {children ?? "Book a Table"}
    </Button>
  );
}
