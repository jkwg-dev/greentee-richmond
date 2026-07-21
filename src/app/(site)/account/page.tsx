import type { User } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { ProfileForm } from "@/components/sections/account/ProfileForm";
import { PageHead } from "@/components/ui/PageHead";
import { Button } from "@/components/ui/Button";
import { FactRows, type Fact } from "@/components/ui/FactRows";
import { getUser } from "@/lib/supabase/server";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: "Your Account",
  robots: { index: false, follow: false },
};

type MetadataKey = "first_name" | "last_name" | "display_name" | "phone";

/**
 * `user_metadata` is an open record upstream; read the §9.4 keys as strings
 * and treat anything else as absent.
 */
function metadataString(user: User, key: MetadataKey): string {
  const value: unknown = user.user_metadata?.[key];
  return typeof value === "string" ? value.trim() : "";
}

/**
 * The account page (booking.md §9.4): session required, signed-out visitors
 * bounce to sign in with next=/account. Email and, when stored, Name as
 * read-only rows, then the Profile section that edits the same metadata. The
 * reservations rows join in B3c. Dynamic by nature of cookies(), never forced
 * static (§9.5).
 */
export default async function AccountPage() {
  const user = await getUser();
  if (!user) redirect("/account/sign-in?next=/account");

  const firstName = metadataString(user, "first_name");
  const lastName = metadataString(user, "last_name");
  const phone = metadataString(user, "phone");
  // The read-only row prefers the stored display_name, which is what the app
  // shows. An account from the earlier single-field build has it without the
  // parts; that account's form opens empty and heals on the first save.
  const shownName =
    metadataString(user, "display_name") || `${firstName} ${lastName}`.trim();
  const facts: Fact[] = [
    { label: "Email", value: user.email ?? "" },
    ...(shownName ? [{ label: "Name", value: shownName }] : []),
  ];

  return (
    <>
      <PageHead eyebrow="Your Account" title="Your account." />
      <div className="mx-auto max-w-[1360px] px-[6vw] pt-[46px] pb-[110px]">
        <Reveal as="div" delay={120} className="max-w-[420px]">
          <FactRows facts={facts} />
          <div className="mt-12">
            <ProfileForm
              firstName={firstName}
              lastName={lastName}
              phone={phone}
            />
          </div>
          <p className="text-mist mt-12 text-[13.5px]">
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
