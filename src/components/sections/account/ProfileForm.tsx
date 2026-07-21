"use client";

import { useActionState } from "react";
import {
  updateProfile,
  type ProfileFormState,
} from "@/app/(site)/account/actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { cn } from "@/lib/utils";
import { NameFields } from "./NameFields";

/**
 * The /account profile section (booking.md §9.4 as amended): a tracked
 * microlabel over the two-column name row and Phone, all prefilled from user
 * metadata, and a solid Save. Both name parts are required; the phone is
 * optional and unformatted. Prefill reads the name parts, never the derived
 * `display_name`, so nothing has to guess at splitting a name. Email is
 * identity, so it stays a read-only FactRow above rather than a field here.
 * Success and the §9.7 fallback share one status line beneath the button.
 */
export function ProfileForm({
  firstName,
  lastName,
  phone,
}: {
  firstName: string;
  lastName: string;
  phone: string;
}) {
  const [state, formAction, pending] = useActionState<
    ProfileFormState,
    FormData
  >(updateProfile, {});

  // A field-routed error shows in its own §9.6 slot; anything else is the
  // form-level fallback.
  const formError = state.field ? undefined : state.error;
  const status = formError ?? (state.saved ? "Profile updated." : "");

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (pending) event.preventDefault();
      }}
    >
      <p className="text-mist mb-6 text-[9.5px] leading-none font-medium tracking-[0.28em] uppercase">
        Profile
      </p>
      <NameFields
        firstName={firstName}
        lastName={lastName}
        firstNameError={state.field === "firstName" ? state.error : undefined}
        lastNameError={state.field === "lastName" ? state.error : undefined}
      />
      <Field
        label="Phone"
        name="phone"
        type="tel"
        autoComplete="tel"
        className="mt-7"
        hint="Optional."
        defaultValue={phone}
      />
      <Button
        type="submit"
        variant="solid"
        aria-disabled={pending || undefined}
        className={cn("mt-9 min-h-[44px] w-full", pending && "opacity-40")}
      >
        Save Changes
      </Button>
      <p
        aria-live="polite"
        className={cn(
          "mt-5 min-h-[17px] text-[12.5px]",
          formError ? "text-champagne" : "text-mist",
        )}
      >
        {status}
      </p>
    </form>
  );
}
