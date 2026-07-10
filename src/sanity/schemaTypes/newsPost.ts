import { defineField, defineType } from "sanity";

/**
 * News post (docs §4.1): feeds /news under the News chip and the Home teaser.
 * `date` is the newest-first sort key on the news index.
 */
export const newsPost = defineType({
  name: "newsPost",
  title: "News Post",
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
      name: "date",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "timing",
      title: "Timing label",
      type: "string",
      description: "Short editorial label, e.g. \"This Fall\".",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
      description: "News card, cropped 16:10 (the featured slot crops 16:9). 1600×1000 or larger.",
    }),
    defineField({ name: "excerpt", type: "text", rows: 2 }),
    defineField({ name: "body", type: "array", of: [{ type: "block" }] }),
  ],
  preview: { select: { title: "title", subtitle: "timing" } },
});
