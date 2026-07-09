import Link from "next/link";
import { cn } from "@/lib/utils";

export type BrandMarkProps = {
  /** `/` in the header, `#top` in the footer (docs §3.4). */
  href: string;
  className?: string;
};

/** "GreenTee Richmond" over "Center" (docs §3.4). Shared by the header and footer. */
export function BrandMark({ href, className }: BrandMarkProps) {
  return (
    <Link
      href={href}
      className={cn("flex flex-col leading-none", className)}
      aria-label="GreenTee Richmond Center, home"
    >
      {/* 19px below 560px keeps the mark on one line beside the header CTA
          and hamburger at a true 390px (docs §10). */}
      <span className="font-serif text-[22px] font-semibold tracking-[0.03em] max-[560px]:text-[19px]">
        GreenTee Richmond
      </span>
      <span className="text-champagne mt-1.5 text-[8px] font-medium tracking-[0.44em] uppercase">
        Center
      </span>
    </Link>
  );
}
