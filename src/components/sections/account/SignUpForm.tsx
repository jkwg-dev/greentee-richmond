"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type AuthFormState } from "@/app/(site)/account/actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

/**
 * Sign up form (booking.md §9.4, §9.5): email and a single password field
 * with the §9.7 microcopy. Same pending and error behavior as sign in.
 */
export function SignUpForm({ next }: { next: string | null }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    signUp,
    {},
  );
  const signInHref = `/account/sign-in${
    next ? `?next=${encodeURIComponent(next)}` : ""
  }`;

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (pending) event.preventDefault();
      }}
      className="max-w-[420px]"
    >
      {next && <input type="hidden" name="next" value={next} />}
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.email}
        error={state.field === "email" ? state.error : undefined}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        className="mt-7"
        hint="At least 6 characters."
        error={state.field === "password" ? state.error : undefined}
      />
      <Button
        type="submit"
        variant="solid"
        aria-disabled={pending || undefined}
        className={cn("mt-9 min-h-[44px] w-full", pending && "opacity-40")}
      >
        Create Account
      </Button>
      <p className="mt-6 text-[12.5px]">
        <Link
          href={signInHref}
          className="text-mist hover:text-ivory decoration-champagne/40 underline underline-offset-4 transition-colors"
        >
          Already with us? Sign in.
        </Link>
      </p>
    </form>
  );
}
