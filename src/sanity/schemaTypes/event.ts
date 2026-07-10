import { defineField, defineType } from "sanity";

/**
 * Event (docs §4.1): feeds /news under the Events chip and the Home teaser.
 * `start` doubles as the newest-first sort key on the news index.
 */
export const event = defineType({
  name: "event",
  title: "Event",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "timing",
      title: "Timing label",
      type: "string",
      description: "Short editorial label, e.g. \"From September\", \"Saturdays\".",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "start", type: "datetime" }),
    defineField({ name: "end", type: "datetime" }),
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
      description: "News card, cropped 16:10 (the featured slot crops 16:9). 1600×1000 or larger.",
    }),
    defineField({ name: "excerpt", type: "text", rows: 2 }),
    defineField({ name: "body", type: "array", of: [{ type: "block" }] }),
    defineField({
      name: "cta",
      type: "object",
      fields: [
        defineField({ name: "label", type: "string" }),
        defineField({ name: "url", type: "string" }),
      ],
    }),
  ],
  preview: { select: { title: "title", subtitle: "timing" } },
});
