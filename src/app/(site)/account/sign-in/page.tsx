import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { AccountHead } from "@/components/sections/account/AccountHead";
import { SignInForm } from "@/components/sections/account/SignInForm";
import { getUser } from "@/lib/supabase/server";
import { sanitizeNext } from "../redirect-target";

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false, follow: false },
};

/**
 * Sign in (booking.md §9.4): honors a sanitized ?next= (internal paths
 * only); visited while signed in it redirects to next, else /account.
 */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = sanitizeNext(params.next);

  if (await getUser()) redirect(next ?? "/account");

  return (
    <>
      <AccountHead
        title="Sign in."
        support="Reserve bays and manage your bookings with one account."
      />
      <div className="mx-auto max-w-[1360px] px-[6vw] pt-[46px] pb-[110px]">
        <Reveal as="div" delay={120}>
          <SignInForm next={next} />
        </Reveal>
      </div>
    </>
  );
}
