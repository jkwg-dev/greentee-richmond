import Link from "next/link";
import { BrandMark } from "./BrandMark";
import {
  familyLinks,
  networkLinks,
  primaryNav,
  visit,
  type NavLink,
} from "@/lib/site";

function FooterLink({ link, className }: { link: NavLink; className: string }) {
  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

/**
 * Canonical footer (docs §3.4), mirroring the header and carrying `id="contact"`
 * as the Book a Bay anchor target. Home v22 is the reference; the stale footers
 * in the other mockups are ignored (docs §15.9).
 */
export function SiteFooter() {
  const columnLinkClass =
    "text-[9.5px] font-medium tracking-[0.22em] text-mist uppercase transition-colors hover:text-ivory";

  return (
    <footer
      id="contact"
      className="border-hair flex flex-wrap items-end justify-between gap-[30px] border-t px-[6vw] pt-14 pb-11"
    >
      <BrandMark href="#top" />

      <nav aria-label="Footer" className="flex gap-[26px]">
        {primaryNav.map((link) => (
          <Link key={link.href} href={link.href} className={columnLinkClass}>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="text-mist/65 text-right text-[10.5px] leading-[2] tracking-[0.06em]">
        <p>
          {visit.address} · {visit.hours} · {visit.phone}
        </p>
        <p>{visit.designCredit}</p>
        <p>© 2026 GreenTee Richmond Center.</p>
      </div>

      <div className="border-champagne/10 mt-9 flex w-full flex-col gap-2.5 border-t pt-6">
        <p className="flex flex-wrap items-baseline gap-x-[18px] gap-y-1.5">
          <b className="text-mist/50 text-[8.5px] font-medium tracking-[0.3em] uppercase">
            GreenTee Network
          </b>
          {networkLinks.map((link) => (
            <FooterLink
              key={link.label}
              link={link}
              className={columnLinkClass}
            />
          ))}
        </p>
        <p className="flex flex-wrap items-baseline gap-x-[18px] gap-y-1.5">
          <b className="text-mist/50 text-[8.5px] font-medium tracking-[0.3em] uppercase">
            Family
          </b>
          {familyLinks.map((link) => (
            <FooterLink
              key={link.label}
              link={link}
              className={columnLinkClass}
            />
          ))}
        </p>
      </div>
    </footer>
  );
}
