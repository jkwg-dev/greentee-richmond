/**
 * §9.4 `next` sanitization: internal paths only. Must start with a single
 * "/"; protocol-relative ("//"), scheme-carrying (any ":"), and backslash
 * values reject to null. Shared by the actions and the auth pages.
 */
export function sanitizeNext(value: unknown): string | null {
  if (typeof value !== "string" || value === "") return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (value.includes(":") || value.includes("\\")) return null;
  return value;
}
