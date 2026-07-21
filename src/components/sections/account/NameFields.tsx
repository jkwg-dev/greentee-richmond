import { Field } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

/**
 * The two halves of one name, side by side (booking.md §9.4): the single
 * two-column exception to the narrow single-column form rule, collapsing to
 * stacked below 560px. Shared by sign up and the profile section so the pair,
 * its autocomplete tokens, and its collapse point can never drift apart.
 *
 * `items-start` keeps the inputs aligned when only one half carries an error
 * line, rather than stretching the pair to a common height.
 */
export function NameFields({
  firstName,
  lastName,
  firstNameError,
  lastNameError,
  className,
}: {
  firstName?: string;
  lastName?: string;
  firstNameError?: string;
  lastNameError?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 items-start gap-5",
        "max-[560px]:grid-cols-1 max-[560px]:gap-7",
        className,
      )}
    >
      <Field
        label="First Name"
        name="firstName"
        autoComplete="given-name"
        required
        defaultValue={firstName}
        error={firstNameError}
      />
      <Field
        label="Last Name"
        name="lastName"
        autoComplete="family-name"
        required
        defaultValue={lastName}
        error={lastNameError}
      />
    </div>
  );
}
