"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type AuthFormState } from "@/app/(site)/account/actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

/**
 * Sign in form (booking.md §9.4, §9.5): useActionState over the signIn
 * action. Pending mirrors the Reserve button treatment (aria-disabled plus
 * an opacity utility; a submit guard blocks re-entry); a failed submit keeps
 * the typed email and renders the mapped error in the matching Field slot.
 */
export function SignInForm({ next }: { next: string | null }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    signIn,
    {},
  );
  const signUpHref = `/account/sign-up${
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
        autoComplete="current-password"
        required
        className="mt-7"
        error={state.field === "password" ? state.error : undefined}
      />
      <Button
        type="submit"
        variant="solid"
        aria-disabled={pending || undefined}
        className={cn("mt-9 min-h-[44px] w-full", pending && "opacity-40")}
      >
        Sign In
      </Button>
      <p className="mt-6 text-[12.5px]">
        <Link
          href={signUpHref}
          className="text-mist hover:text-ivory decoration-champagne/40 underline underline-offset-4 transition-colors"
        >
          New here? Create an account.
        </Link>
      </p>
    </form>
  );
}
