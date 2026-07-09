import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * The only button styles in the system (docs §2.3). Sharp corners, tracked
 * uppercase label. `solid` and `light` carry ink text; `ghost` is champagne on
 * dark surfaces only. The `sm` size serves the header and rails.
 */
const button = cva(
  "inline-flex cursor-pointer items-center justify-center gap-3 border font-medium whitespace-nowrap uppercase leading-none transition-[background-color,color,border-color] duration-400 [will-change:transform]",
  {
    variants: {
      variant: {
        solid:
          "border-champagne bg-champagne text-ink hover:border-champagne-bright hover:bg-champagne-bright",
        ghost:
          "border-champagne bg-transparent text-champagne hover:bg-champagne/10 hover:text-champagne-bright",
        light:
          "border-ivory bg-ivory text-ink hover:border-white hover:bg-white",
      },
      size: {
        default: "px-8 py-[15px] text-[10.5px] tracking-[0.22em]",
        sm: "px-[22px] py-[11px] text-[9.5px] tracking-[0.22em]",
      },
    },
    defaultVariants: { variant: "solid", size: "default" },
  },
);

type ButtonVariants = VariantProps<typeof button>;

type ButtonAsButton = ButtonVariants &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = ButtonVariants &
  Omit<React.ComponentPropsWithoutRef<typeof Link>, "href"> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/** Renders a Next `<Link>` when `href` is present, otherwise a `<button>`. */
export function Button({ variant, size, className, ...props }: ButtonProps) {
  const classes = cn(button({ variant, size }), className);

  if (props.href !== undefined) {
    const { href, ...rest } = props as ButtonAsLink;
    return <Link href={href} className={classes} {...rest} />;
  }

  const { href: _omit, type, ...rest } = props as ButtonAsButton;
  return <button type={type ?? "button"} className={classes} {...rest} />;
}
