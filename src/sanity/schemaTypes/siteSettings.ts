import { defineField, defineType } from "sanity";

/**
 * Global settings singleton (docs §11.4): the single source for the center's
 * hours and address (footer visit line, outro visit line). `openSummary` is
 * the outro's compact phrasing of the same facts; it extends §11.4's field
 * list and is flagged in the Phase 6 report.
 */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "logo",
      type: "image",
      description: "SVG preferred; a monochrome ivory mark reads best on noir.",
    }),
    defineField({
      name: "phone",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "address",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "hours",
      type: "string",
      description: 'Footer form, e.g. "Daily, 06:00 to 24:00".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "openSummary",
      type: "string",
      description:
        'Compact outro visit line, e.g. "Open daily · 06:00 to 24:00 · Garden Way, Richmond".',
    }),
    defineField({ name: "email", type: "string" }),
    defineField({ name: "socials", type: "array", of: [{ type: "navLink" }] }),
    // bookingUrl was removed by the B3a ruling (design.md §11.4):
    // BOOK_A_BAY_HREF in src/lib/site.ts is the single CTA target source.
    defineField({ name: "careersUrl", type: "string" }),
    defineField({
      name: "familyLinks",
      type: "array",
      of: [{ type: "navLink" }],
    }),
    defineField({
      name: "networkLinks",
      type: "array",
      of: [{ type: "navLink" }],
    }),
    defineField({ name: "seo", type: "seo", title: "Default SEO" }),
  ],
  preview: { prepare: () => ({ title: "Site Settings" }) },
});
