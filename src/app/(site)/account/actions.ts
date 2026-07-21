"use server";

import type { AuthError } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
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
  field?: NameField | "email" | "password";
  /** Echoed back so a failed submit keeps the typed email (§9.5). */
  email?: string;
  /** Echoed back with the email, for the same reason. */
  firstName?: string;
  lastName?: string;
};

type NameField = "firstName" | "lastName";

type MappedError = { error: string; field: "email" | "password" };

/** The §9.7 name errors, one per part, shared by sign up and the profile save. */
const NAME_ERROR: Record<NameField, string> = {
  firstName: "Please enter your first name.",
  lastName: "Please enter your last name.",
};

/**
 * The §9.4 name rule: trimmed with internal whitespace collapsed, so
 * "  Jane   Doe " is stored as "Jane Doe" and a whitespace-only entry reads
 * as empty.
 */
const normalizeName = (value: FormDataEntryValue | null): string =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");

/**
 * The name as the app itself stores it (§9.4 as amended 2026-07-21, after the
 * metadata probe): `first_name` and `last_name` as entered, plus a derived
 * `display_name` of first + a single space + last. We write all three, so
 * whichever key the app reads is correct. `display_name` is derived here and
 * is never an independent input.
 */
const nameMetadata = (firstName: string, lastName: string) => ({
  first_name: firstName,
  last_name: lastName,
  display_name: `${firstName} ${lastName}`,
});

/** The first empty part, so the §9.7 error lands beside the field at fault. */
const missingNameField = (
  firstName: string,
  lastName: string,
): NameField | null =>
  !firstName ? "firstName" : !lastName ? "lastName" : null;

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
  const firstName = normalizeName(formData.get("firstName"));
  const lastName = normalizeName(formData.get("lastName"));
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = sanitizeNext(formData.get("next"));

  // Both parts required (booking.md §9.4): a reservation reaches the front
  // desk under this name. Checked before the network call so a blank submit
  // costs none.
  const missing = missingNameField(firstName, lastName);
  if (missing) {
    return {
      error: NAME_ERROR[missing],
      field: missing,
      email,
      firstName,
      lastName,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // Metadata only (booking.md §9.4): the three name keys in the app's own
    // shape, so app-created and web-created accounts are identical. The
    // Supabase top-level phone identity field is never written.
    options: { data: nameMetadata(firstName, lastName) },
  });
  if (error) return { ...mapAuthError(error), email, firstName, lastName };

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
      firstName,
      lastName,
    };
  }

  redirect(next ?? "/account");
}

export type ProfileFormState = {
  error?: string;
  /** Which name field's §9.6 error slot shows the message. */
  field?: NameField;
  /** Drives the §9.7 confirmation line (booking.md §9.4). */
  saved?: boolean;
};

/**
 * The /account profile save (booking.md §9.4 as amended). Writes user
 * metadata only: the three name keys in the app's own shape, so a web edit
 * lands on whichever key the app reads, plus `phone` beside them. Never the
 * Supabase top-level phone identity field. Email is identity and is not
 * touched.
 *
 * An account created by the earlier single-field build carries `display_name`
 * with no name parts; it opens with empty name fields and heals on the first
 * save. Nothing backfills existing accounts.
 */
export async function updateProfile(
  _previous: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const firstName = normalizeName(formData.get("firstName"));
  const lastName = normalizeName(formData.get("lastName"));
  // Optional, trimmed, no format enforcement (booking.md §9.4). Metadata
  // merges rather than replaces, so an emptied field sends null: that drops
  // the key instead of leaving an empty string behind, which keeps "phone
  // when given" literal and still lets a wrong number be cleared. Every other
  // key on the account (the app's own locale and consent flags) is untouched
  // by the merge.
  const phone = String(formData.get("phone") ?? "").trim();

  const missing = missingNameField(firstName, lastName);
  if (missing) return { error: NAME_ERROR[missing], field: missing };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { ...nameMetadata(firstName, lastName), phone: phone || null },
  });
  if (error) return { error: "Something went wrong. Please try again." };

  // The Name FactRow above the form reads the same metadata; refresh it so
  // the page and the form never disagree after a save.
  revalidatePath("/account");
  return { saved: true };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
