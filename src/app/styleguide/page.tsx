import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { fallbackSettings } from "@/lib/site";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { HeroParticles } from "@/components/canvas/HeroParticles";
import { IntroCurtain } from "@/components/motion/IntroCurtain";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { StatCounter } from "@/components/motion/StatCounter";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FactRows } from "@/components/ui/FactRows";
import { Field } from "@/components/ui/Field";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ChipFilterDemo, FullMenuDemo } from "./demos";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const TOKENS = [
  { name: "noir", value: "#0a0a0b", swatch: "bg-noir border border-hair" },
  { name: "noir-soft", value: "#131315", swatch: "bg-noir-soft" },
  { name: "ivory", value: "#f2ede2", swatch: "bg-ivory" },
  { name: "mist", value: "#8f8b82", swatch: "bg-mist" },
  { name: "champagne", value: "#c9a66b", swatch: "bg-champagne" },
  { name: "jade", value: "#1f6b4f", swatch: "bg-jade" },
  { name: "jade-text", value: "#57ad85", swatch: "bg-jade-text" },
] as const;

const TINTS = [
  "champagne",
  "jade",
  "rosegold",
  "sage",
  "emerald",
  "iris",
  "map",
] as const;

function Block({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-hair border-t py-16">
      <div className="mb-10">
        <Eyebrow>{title}</Eyebrow>
        {note && (
          <p className="text-mist mt-3 max-w-[560px] text-[13px]">{note}</p>
        )}
      </div>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  return (
    <>
      <IntroCurtain />
      <SiteHeader />

      <main className="px-[6vw] pt-36 pb-24">
        <header className="pb-10">
          <Eyebrow>Design System · Phase 1</Eyebrow>
          <h1 className="mt-6 font-serif text-[clamp(2.6rem,7vw,5rem)] leading-[1.04] font-medium">
            The GreenTee kit of parts.
          </h1>
          <p className="text-mist mt-5 max-w-[620px] text-[14.5px]">
            Every primitive, motion preset, canvas module, and layout element in
            one place. Scroll to see the header settle into its scrolled state;
            resize below 900px for the hamburger and FullMenu.
          </p>
        </header>

        {/* Color tokens */}
        <Block
          title="Color tokens"
          note="90 percent of any screen is noir plus ivory. Champagne is the only global accent; jade stays scoped to Crystal Jade content."
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            {TOKENS.map((token) => (
              <div key={token.name}>
                <div className={`h-20 w-full ${token.swatch}`} />
                <p className="text-ivory mt-2 text-[11px] font-medium tracking-[0.16em] uppercase">
                  {token.name}
                </p>
                <p className="text-mist text-[11px]">{token.value}</p>
              </div>
            ))}
          </div>
        </Block>

        {/* Typography */}
        <Block
          title="Typography"
          note="Cormorant Garamond for display, Inter for body and UI. Italic emphasis closes on a champagne period."
        >
          <div className="space-y-6">
            <p className="font-serif text-[clamp(2.6rem,9vw,7.6rem)] leading-[1.04] font-medium">
              Display H1
            </p>
            <h2 className="font-serif text-[clamp(2.1rem,4.6vw,3.5rem)] leading-[1.1] font-medium">
              Section heading H2, with an{" "}
              <em className="text-champagne italic">emphasis</em>.
            </h2>
            <p className="text-ivory max-w-[560px] text-[15px] leading-[1.85]">
              Body copy at 15px on a 1.85 line height. Light on a dark canvas,
              generous whitespace, one message per screen.
            </p>
            <p className="text-mist text-[13px]">
              Secondary and caption text in mist.
            </p>
            <p className="font-zh text-ivory text-[16px]">
              中文字体堆栈 · PingFang SC fallback (dining only)
            </p>
          </div>
        </Block>

        {/* Buttons */}
        <Block
          title="Button"
          note="solid / ghost / light plus the sm size. Sharp corners, tracked uppercase. Renders a link when given href."
        >
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="solid">Book a Bay</Button>
            <Button variant="ghost">Plan a Room</Button>
            <div className="bg-noir-soft p-3">
              <Button variant="light">Explore the Spaces</Button>
            </div>
            <Button variant="solid" size="sm">
              Book a Bay
            </Button>
            <Button variant="ghost" size="sm">
              Details
            </Button>
            <Button href="/" variant="ghost">
              As a link
            </Button>
          </div>
        </Block>

        {/* Eyebrow + SectionHeading */}
        <Block title="Eyebrow and SectionHeading">
          <div className="space-y-12">
            <div className="flex flex-col gap-4">
              <Eyebrow>Rates &amp; Hours</Eyebrow>
              <Eyebrow align="center">Under Ten Thousand Lights</Eyebrow>
            </div>
            <SectionHeading
              eyebrow="The Spaces"
              title={
                <>
                  Two floors of golf,
                  <br />
                  room by room.
                </>
              }
              sub="From open simulator bays to private VIP rooms, every space in the club is built around the game."
            />
            <SectionHeading
              align="center"
              eyebrow="Under Ten Thousand Lights"
              title={
                <>
                  The course is <em>always</em> open.
                </>
              }
              sub="Book a bay, gather in a private room, or stay for dinner."
            />
          </div>
        </Block>

        {/* PhotoFrame */}
        <Block
          title="PhotoFrame"
          note="Styled pending state for imagery: noir surface, inset vignette, irregular fractal-noise grain. Ships until SanityImage lands."
        >
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {TINTS.map((tint) => (
              <PhotoFrame
                key={tint}
                tint={tint}
                className="aspect-[4/3]"
                label={{ kicker: "Tint", name: tint }}
              />
            ))}
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            <PhotoFrame
              tint="jade"
              className="aspect-[16/9]"
              showMark
              label={{
                kicker: "Image placeholder",
                name: "Crystal Jade Palace · Dining Room",
              }}
              tag="Replace with restaurant photography"
            />
            <PhotoFrame
              tint="champagne"
              className="aspect-[16/9]"
              label={{
                kicker: "Renders to be revealed",
                name: "VVIP Suites 1 to 4",
              }}
            />
          </div>
        </Block>

        {/* Chip */}
        <Block
          title="Chip"
          note="Filter and nav chips. Champagne accent globally, jade for Crystal Jade surfaces. Active state carries fill and weight, not color alone."
        >
          <div className="space-y-6">
            <ChipFilterDemo />
            <div className="flex flex-wrap gap-2.5">
              <Chip accent="champagne" active>
                Champagne active
              </Chip>
              <Chip accent="champagne">Champagne</Chip>
              <Chip accent="jade" active>
                Jade active
              </Chip>
              <Chip accent="jade">Jade</Chip>
            </div>
          </div>
        </Block>

        {/* FactRows */}
        <Block title="FactRows">
          <div className="max-w-[560px]">
            <FactRows
              facts={[
                {
                  label: "Michelin",
                  value: "Vancouver Michelin Star, four consecutive years",
                  detail: "2022 to 2025",
                },
                {
                  label: "Private Rooms",
                  value: "Eight rooms",
                  detail: "Count to confirm",
                },
                { label: "Booking", value: "By the room, hourly" },
              ]}
            />
          </div>
        </Block>

        {/* Field */}
        <Block
          title="Field"
          note="The only text input primitive (booking.md §9.6). Hairline border, champagne focus, autofill repainted to noir-soft. Errors render champagne; the palette has no red."
        >
          <div className="grid max-w-[420px] gap-8">
            <Field
              label="Email"
              name="demo-email"
              type="email"
              autoComplete="email"
            />
            <Field
              label="Password"
              name="demo-password"
              type="password"
              hint="At least 6 characters."
            />
            <Field
              label="Email"
              name="demo-email-error"
              type="email"
              defaultValue="guest@greentee"
              error="That email and password do not match. Try again."
            />
          </div>
        </Block>

        {/* Motion presets */}
        <Block
          title="Reveal"
          note="Opacity plus rise on the [data-reveal] system, once per element. Settles immediately under reduced motion."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[0, 120, 240].map((delay) => (
              <Reveal
                key={delay}
                delay={delay}
                className="border-hair bg-noir-soft text-mist border p-6 text-[13px]"
              >
                Revealed with a {delay}ms delay.
              </Reveal>
            ))}
          </div>
        </Block>

        <Block
          title="SplitHeading"
          note="Per-letter hero bloom: y and blur release on a 0.03 stagger."
        >
          <SplitHeading
            lines={["GreenTee", "Richmond Center"]}
            className="font-serif text-[clamp(2.6rem,9vw,7.6rem)] leading-[1.04] font-medium tracking-[0.012em]"
          />
        </Block>

        <Block
          title="ParallaxImage"
          note="Inner vertical parallax scrubbed across the element's transit. Scroll to see it move; static under reduced motion."
        >
          <ParallaxImage className="h-[320px]" amount={5}>
            <div className="tint-rosegold h-full w-full" />
          </ParallaxImage>
        </Block>

        <Block
          title="StatCounter"
          note="Counts 0 to target over 1.4s cubic ease-out at 50 percent visibility. Reduced motion prints the final value."
        >
          <div className="border-hair grid grid-cols-2 gap-8 border-t pt-10 sm:grid-cols-4">
            {[
              { value: 4, suffix: "", label: "Simulator Bays" },
              { value: 19, suffix: "", label: "Private VIP Rooms" },
              { value: 200, suffix: "+", label: "Championship Courses" },
              { value: 365, suffix: "", label: "Days of Golf a Year" },
            ].map((stat) => (
              <div key={stat.label}>
                <StatCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  className="text-champagne block font-serif text-[clamp(2.4rem,4.5vw,3.6rem)] leading-none font-medium"
                />
                <p className="text-mist mt-3 text-[9.5px] font-medium tracking-[0.26em] uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Block>

        {/* HeroParticles */}
        <Block
          title="HeroParticles"
          note="Calm rising seeds of light, the only canvas module. DPR capped at 2, pauses offscreen and on hidden tabs, hidden under reduced motion."
        >
          <div className="border-hair bg-noir relative h-[380px] overflow-hidden border">
            <HeroParticles />
            <div className="relative z-[5] flex h-full items-center justify-center">
              <p className="text-ivory/80 font-serif text-2xl italic">
                Fifty-six seeds of light.
              </p>
            </div>
          </div>
        </Block>

        {/* FullMenu */}
        <Block
          title="FullMenu"
          note="Mobile navigation overlay with focus trap, Escape to close, and a body scroll lock. Opens from the header hamburger below 900px."
        >
          <FullMenuDemo />
        </Block>
      </main>

      <SiteFooter settings={fallbackSettings} />
    </>
  );
}
