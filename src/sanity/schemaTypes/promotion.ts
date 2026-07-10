import { defineField, defineType } from "sanity";

/**
 * Promotion (docs §4.1, §4.2): a card on /news (Offers chip) and the Home
 * teaser, or the announcement bar when placement is banner. The active window
 * is guarded in GROQ (§4.3), never in components; expired offers disappear
 * without manual cleanup.
 */
export const promotion = defineType({
  name: "promotion",
  title: "Promotion",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
      description: "News card, cropped 16:10 (the featured slot crops 16:9). 1600×1000 or larger.",
    }),
    defineField({
      name: "timing",
      title: "Timing label",
      type: "string",
      description: "Short editorial label, e.g. \"Through August\".",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "summary", type: "text", rows: 2 }),
    defineField({ name: "body", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "activeFrom", type: "datetime" }),
    defineField({ name: "activeTo", type: "datetime" }),
    defineField({
      name: "placement",
      type: "string",
      options: { list: ["card", "banner"], layout: "radio" },
      initialValue: "card",
      description: "banner drives the announcement bar (§4.2); at most one active at a time.",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "link", type: "string" }),
  ],
  preview: { select: { title: "title", subtitle: "placement" } },
});
