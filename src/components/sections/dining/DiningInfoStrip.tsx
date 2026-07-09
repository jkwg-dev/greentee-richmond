import type { Restaurant } from "@/types";

const NOTE_CLASS =
  "text-mist text-[10px] leading-[1.9] font-medium tracking-[0.16em] uppercase";

/**
 * Restaurant details strip above the footer on every `/dining` route (docs
 * §8.2, mockup `.cjp-strip`). Hours, phone, the WeChat handle, and the social
 * URLs are placeholders (§15).
 */
export function DiningInfoStrip({ restaurant }: { restaurant: Restaurant }) {
  const { reserve } = restaurant;

  return (
    <aside
      aria-label="Crystal Jade Palace details"
      className="border-champagne/[0.22] to-70% from-jade/[0.16] mx-[5vw] flex flex-wrap items-baseline gap-x-10 gap-y-3 border bg-linear-to-r to-transparent px-7 py-6"
    >
      <span className="text-ivory font-serif text-[17px] font-medium">
        {restaurant.name}
      </span>
      <span className={NOTE_CLASS}>{reserve.hours.join(" · ")}, daily</span>
      <span className={NOTE_CLASS}>
        {reserve.phone} · WeChat {reserve.wechat}
      </span>
      <span className="ml-auto flex gap-[18px] max-[900px]:ml-0">
        {restaurant.socials.map((social) => (
          <a
            key={social.label}
            href={social.url}
            className={`${NOTE_CLASS} border-champagne/35 hover:text-ivory border-b transition-colors`}
          >
            {social.label}
          </a>
        ))}
      </span>
    </aside>
  );
}
