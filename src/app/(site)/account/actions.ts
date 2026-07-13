"use server";

import type { AuthError } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sanitizeNext } from "./redirect-target";

/**
 * Auth Server Actions (booking.md §9.3). The browser talks to our server
 * only; errors leave here already mapped to the §9.7 strings, never as raw
 * Supabase messages. Passwords are read from the form and forwarded once,
 * never logged or echoed (§9.8).
 */

export type AuthFormState = {
  error?: string;
  /** Which field's §9.6 error slot shows the message. */
  field?: "email" | "password";
  /** Echoed back so a failed submit keeps the typed email (§9.5). */
  email?: string;
};

type MappedError = { error: string; field: "email" | "password" };

/** Supabase error to the §9.7 strings: code match first, message fallback otherwise. */
function mapAuthError(authError: AuthError): MappedError {
  const code = authError.code ?? "";
  const message = authError.message ?? "";

  if (
    code === "invalid_credentials" ||
    /invalid login credentials/i.test(message)
  ) {
    return {
      error: "That email and password do not match. Try again.",
      field: "password",
    };
  }
  if (
    code === "user_already_exists" ||
    code === "email_exists" ||
    /already (registered|exists)/i.test(message)
  ) {
    return {
      error: "An account with this email already exists. Sign in instead.",
      field: "email",
    };
  }
  if (
    code === "weak_password" ||
    /password.*(at least|too short|weak)/i.test(message)
  ) {
    return {
      error: "Passwords need at least 6 characters.",
      field: "password",
    };
  }
  if (
    code === "over_request_rate_limit" ||
    code === "over_email_send_rate_limit" ||
    /rate limit|too many/i.test(message)
  ) {
    return {
      error: "Too many attempts. Wait a moment and try again.",
      field: "password",
    };
  }
  return {
    error: "Something went wrong. Please try again.",
    field: "password",
  };
}

export async function signIn(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = sanitizeNext(formData.get("next"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ...mapAuthError(error), email };

  redirect(next ?? "/account");
}

export async function signUp(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = sanitizeNext(formData.get("next"));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { ...mapAuthError(error), email };

  if (!data.session) {
    // Parity misconfiguration (booking.md §9.2): Confirm email must stay
    // off. Surface the config string; never build a confirmation screen.
    console.error(
      "Supabase signUp returned a user without a session; check that Confirm email is disabled on the project (booking.md §9.2).",
    );
    return {
      error: "Sign up is not available right now. Please try again later.",
      field: "password",
      email,
    };
  }

  redirect(next ?? "/account");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
