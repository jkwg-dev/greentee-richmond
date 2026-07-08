import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Filter / nav chip (docs §7 news filters, §8 menu filters). Champagne accent
 * globally; jade accent for Crystal Jade surfaces only. 44px touch target
 * (docs §10). Active state never relies on color alone: fill plus weight.
 */
const chip = cva(
  "inline-flex min-h-[44px] cursor-pointer items-center border px-5 py-[10px] text-[9.5px] font-medium leading-none tracking-[0.24em] uppercase transition-[background-color,color,border-color] duration-300",
  {
    variants: {
      accent: { champagne: "", jade: "" },
      active: { true: "", false: "" },
    },
    compoundVariants: [
      {
        accent: "champagne",
        active: false,
        className:
          "border-champagne/[0.26] text-mist hover:border-champagne/50 hover:text-ivory",
      },
      {
        accent: "champagne",
        active: true,
        className: "border-champagne bg-champagne text-ink",
      },
      {
        accent: "jade",
        active: false,
        className:
          "border-jade-text/[0.35] text-jade-mist hover:border-jade-text/70 hover:text-ivory",
      },
      {
        accent: "jade",
        active: true,
        className: "border-jade-text bg-jade-text text-ink-jade",
      },
    ],
    defaultVariants: { accent: "champagne", active: false },
  },
);

type ChipVariants = VariantProps<typeof chip>;

type ChipAsButton = Omit<ChipVariants, "active"> & {
  active?: boolean;
  href?: undefined;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

type ChipAsLink = Omit<ChipVariants, "active"> & {
  active?: boolean;
  href: string;
} & Omit<React.ComponentPropsWithoutRef<typeof Link>, "href">;

export type ChipProps = ChipAsButton | ChipAsLink;

export function Chip({
  accent,
  active = false,
  className,
  ...props
}: ChipProps) {
  const classes = cn(chip({ accent, active }), className);

  if (props.href !== undefined) {
    const { href, ...rest } = props as ChipAsLink;
    return (
      <Link
        href={href}
        aria-current={active ? "true" : undefined}
        className={classes}
        {...rest}
      />
    );
  }

  const { href: _omit, type, ...rest } = props as ChipAsButton;
  return (
    <button
      type={type ?? "button"}
      aria-pressed={active}
      className={classes}
      {...rest}
    />
  );
}
