import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * Account pagehead (booking.md §9.4): news index head proportions with the
 * §9.7 strings. The eyebrow is always "Your Account"; the support line is
 * optional (the account page has none).
 */
export function AccountHead({
  title,
  support,
}: {
  title: string;
  support?: string;
}) {
  return (
    <div className="mx-auto max-w-[1360px] px-[6vw] pt-[158px] pb-2 max-[900px]:pt-[130px]">
      <Reveal as="div">
        <Eyebrow className="mb-[22px]">Your Account</Eyebrow>
      </Reveal>
      <Reveal
        as="h1"
        delay={100}
        className="font-serif text-[clamp(2.4rem,5.4vw,4.2rem)] leading-[1.05] font-medium"
      >
        {title}
      </Reveal>
      {support && (
        <Reveal
          as="p"
          delay={200}
          className="text-mist mt-[18px] max-w-[560px] text-[14.5px]"
        >
          {support}
        </Reveal>
      )}
    </div>
  );
}
