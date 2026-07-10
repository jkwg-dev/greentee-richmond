import { defineField, defineType } from "sanity";

/**
 * Shared field objects (docs §11.4). Only genuinely repeated shapes live here:
 * SEO metadata, labelled links, and label/value fact rows.
 */

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string" }),
    defineField({ name: "description", type: "text", rows: 2 }),
  ],
});

export const navLink = defineType({
  name: "navLink",
  title: "Link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url",
      type: "string",
      description: "Absolute URL, route, or # stub until the target exists.",
      validation: (rule) => rule.required(),
    }),
  ],
});

export const fact = defineType({
  name: "fact",
  title: "Fact row",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "value",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "detail",
      type: "string",
      description: "Optional second line, e.g. \"Placeholder, confirm count\".",
    }),
  ],
});
