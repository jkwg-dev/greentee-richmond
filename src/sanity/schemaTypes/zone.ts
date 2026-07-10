import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * A /spaces zone, nine documents (docs §11.4, §6). Placeholder-only display
 * fields (heroTint, heroTag, pending frame art) belong to the UI layer, not
 * the schema (§11.4). `cta.variant` extends §11.4's `cta {label, href}` —
 * the mock varies solid/ghost per zone; flagged in the report. The dining
 * panel's two CTAs are fixed routes supplied by the mapping layer.
 */
export const zone = defineType({
  name: "zone",
  title: "Zone",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      description: "Doubles as the /spaces anchor (docs §11.4).",
      options: { source: "name" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "floor",
      type: "string",
      options: { list: ["1F", "2F"], layout: "radio" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "chipLabel",
      type: "string",
      description: "Abbreviated label for the chip bar; the rail uses name.",
    }),
    defineField({
      name: "areaLabel",
      type: "string",
      description: "Hero eyebrow override, e.g. \"Private Area\" on 2F.",
    }),
    defineField({ name: "conceptTitle", type: "string" }),
    defineField({ name: "conceptLine", type: "string" }),
    defineField({ name: "lead", type: "text", rows: 3 }),
    defineField({ name: "body", type: "text", rows: 4 }),
    defineField({ name: "facts", type: "array", of: [{ type: "fact" }] }),
    defineField({
      name: "heroImage",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "order",
      type: "number",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cta",
      type: "object",
      fields: [
        defineField({ name: "label", type: "string" }),
        defineField({ name: "href", type: "string" }),
        defineField({
          name: "variant",
          type: "string",
          options: { list: ["solid", "ghost"], layout: "radio" },
        }),
      ],
    }),
    defineField({
      name: "diningPanel",
      type: "object",
      description: "Dining zone only (docs §6.3).",
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "title", type: "text", rows: 2 }),
        defineField({ name: "copy", type: "text", rows: 3 }),
      ],
    }),
    defineField({
      name: "rooms",
      type: "array",
      description:
        "VIP/VVIP only. A room with pending: true renders the designed pending card (§5.4); never fill it with stock imagery.",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "name", type: "string" }),
            defineField({
              name: "motif",
              type: "string",
              options: { list: ["Sprout", "Grain", "Leaf", "Crystal"] },
            }),
            defineField({ name: "line", type: "string" }),
            defineField({
              name: "image",
              type: "image",
              options: { hotspot: true },
            }),
            defineField({ name: "pending", type: "boolean" }),
          ],
          preview: { select: { title: "name", subtitle: "motif" } },
        }),
      ],
    }),
    defineField({ name: "seo", type: "seo" }),
  ],
  orderings: [
    {
      title: "Page order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "floor", order: "order" },
    prepare: ({ title, subtitle, order }) => ({
      title: `${String(order).padStart(2, "0")} · ${title}`,
      subtitle,
    }),
  },
});
