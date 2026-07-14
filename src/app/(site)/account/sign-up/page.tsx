import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { PageHead } from "@/components/ui/PageHead";
import { SignUpForm } from "@/components/sections/account/SignUpForm";
import { getUser } from "@/lib/supabase/server";
import { sanitizeNext } from "../redirect-target";

export const metadata: Metadata = {
  title: "Create Account",
  robots: { index: false, follow: false },
};

/**
 * Sign up (booking.md §9.4): same shell and next behavior as sign in;
 * email and password only per hedge 7 (metadata fields join later).
 */
export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = sanitizeNext(params.next);

  if (await getUser()) redirect(next ?? "/account");

  return (
    <>
      <PageHead
        eyebrow="Your Account"
        title="Create your account."
        support="Set up once. Reserve bays and manage your bookings in one place."
      />
      <div className="mx-auto max-w-[1360px] px-[6vw] pt-[46px] pb-[110px]">
        <Reveal as="div" delay={120}>
          <SignUpForm next={next} />
        </Reveal>
      </div>
    </>
  );
}
