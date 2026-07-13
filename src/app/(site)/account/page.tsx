import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { AccountHead } from "@/components/sections/account/AccountHead";
import { Button } from "@/components/ui/Button";
import { FactRows } from "@/components/ui/FactRows";
import { getUser } from "@/lib/supabase/server";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: "Your Account",
  robots: { index: false, follow: false },
};

/**
 * The account page (booking.md §9.4): session required, signed-out visitors
 * bounce to sign in with next=/account. One Email row in B2; the
 * reservations rows join in B3. Dynamic by nature of cookies(), never
 * forced static (§9.5).
 */
export default async function AccountPage() {
  const user = await getUser();
  if (!user) redirect("/account/sign-in?next=/account");

  return (
    <>
      <AccountHead title="Your account." />
      <div className="mx-auto max-w-[1360px] px-[6vw] pt-[46px] pb-[110px]">
        <Reveal as="div" delay={120} className="max-w-[420px]">
          <FactRows facts={[{ label: "Email", value: user.email ?? "" }]} />
          <p className="text-mist mt-6 text-[13.5px]">
            Your reservations will appear here once online booking opens.
          </p>
          <form action={signOut} className="mt-9">
            <Button type="submit" variant="ghost">
              Sign Out
            </Button>
          </form>
        </Reveal>
      </div>
    </>
  );
}
