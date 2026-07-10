import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Home content singleton (docs §11.4, §5). Heading strings keep the light
 * conventions the sections render with: `\n` forces a line break, `*word*`
 * marks the italic champagne emphasis (RichHeading). The Rates column labels
 * ("Bays & Rooms" / "Hours & Availability") stay static UI. `manifesto.eyebrow`
 * extends §11.4's field list (the section renders one); flagged in the report.
 */
export const homePage = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({
          name: "titleLines",
          type: "array",
          of: [{ type: "string" }],
          validation: (rule) => rule.required().length(2),
        }),
        defineField({ name: "italicLine", type: "string" }),
        defineField({ name: "supportLine", type: "string" }),
        defineField({ name: "media", type: "image", options: { hotspot: true } }),
      ],
    }),
    defineField({
      name: "manifesto",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({
          name: "lines",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({ name: "text", type: "string" }),
                defineField({ name: "emphasis", type: "string" }),
              ],
            }),
          ],
        }),
        defineField({ name: "caption", type: "text", rows: 2 }),
      ],
    }),
    defineField({
      name: "panoramaBand",
      type: "object",
      fields: [
        defineField({ name: "image", type: "image", options: { hotspot: true } }),
        defineField({ name: "caption", type: "string" }),
      ],
    }),
    defineField({
      name: "marqueeItems",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "rates",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "title", type: "text", rows: 2 }),
        defineField({ name: "sub", type: "text", rows: 2 }),
        defineField({
          name: "rateRows",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({ name: "name", type: "string" }),
                defineField({ name: "detail", type: "string" }),
                defineField({ name: "price", type: "string" }),
                defineField({ name: "unit", type: "string" }),
              ],
            }),
          ],
        }),
        defineField({
          name: "hourRows",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({ name: "name", type: "string" }),
                defineField({ name: "detail", type: "string" }),
                defineField({ name: "value", type: "string" }),
              ],
            }),
          ],
        }),
        defineField({ name: "footnote", type: "text", rows: 2 }),
        defineField({
          name: "stats",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({ name: "value", type: "number" }),
                defineField({ name: "suffix", type: "string" }),
                defineField({ name: "label", type: "string" }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "newsTeaser",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "title", type: "string" }),
        defineField({ name: "sub", type: "text", rows: 2 }),
      ],
    }),
    defineField({
      name: "journeyPanels",
      type: "array",
      description:
        "Curated Home content (docs §5.2), not derived from zones. Order sets the index.",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "name", type: "string" }),
            defineField({ name: "conceptTitle", type: "string" }),
            defineField({ name: "floorLabel", type: "string" }),
            defineField({
              name: "anchor",
              type: "string",
              description: "The /spaces anchor, e.g. \"/spaces#dining\".",
            }),
            defineField({ name: "line", type: "text", rows: 2 }),
            defineField({
              name: "accent",
              type: "string",
              description:
                "Journey-scoped inline accent hex (docs §5.2); never a global token.",
            }),
            defineField({
              name: "layout",
              type: "string",
              options: {
                list: ["two", "twoFlipped", "solo"],
                layout: "radio",
              },
            }),
            defineField({
              name: "plates",
              type: "array",
              description:
                "Placeholder tints stay in the UI layer (§11.4); a plate with no image and a pending label is the designed VVIP state (§5.4).",
              of: [
                defineArrayMember({
                  type: "object",
                  fields: [
                    defineField({
                      name: "image",
                      type: "image",
                      options: { hotspot: true },
                    }),
                    defineField({
                      name: "pendingLabel",
                      type: "object",
                      fields: [
                        defineField({ name: "kicker", type: "string" }),
                        defineField({ name: "name", type: "string" }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "conceptTitle" },
          },
        }),
      ],
    }),
    defineField({
      name: "spacesIntro",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "title", type: "text", rows: 2 }),
        defineField({ name: "sub", type: "text", rows: 2 }),
        defineField({ name: "linkLabel", type: "string" }),
      ],
    }),
    defineField({
      name: "outro",
      type: "object",
      description: "The visit line renders from siteSettings (docs §11.4).",
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "title", type: "string" }),
        defineField({ name: "line", type: "text", rows: 2 }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Home Page" }) },
});
