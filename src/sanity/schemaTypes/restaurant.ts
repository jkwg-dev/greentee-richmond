import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Crystal Jade Palace singleton (docs §8.4, §11.4). Heritage and Richmond
 * narratives are portable text; the mapping layer reads the first paragraph as
 * the serif lead (§8.3). `menus[].detail` ("Pricing on enquiry") extends
 * §8.4's `menus {label, line}`; flagged in the report. Dishes live as
 * separate `dish` documents (§4.1).
 */
export const restaurant = defineType({
  name: "restaurant",
  title: "Restaurant · Crystal Jade Palace",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tagline",
      type: "string",
      description: "Credential line under the hero H1 (§8.3).",
    }),
    defineField({
      name: "lede",
      type: "text",
      rows: 2,
      description: "Feeds the Home dining preview (§5.1 S5).",
    }),
    defineField({
      name: "heroMedia",
      type: "image",
      options: { hotspot: true },
      description: "Landing hero photo or video-loop poster; pending until the tenant delivers (§11.6).",
    }),
    defineField({
      name: "intro",
      type: "object",
      description: "The /dining landing intro (§8.3 item 2).",
      fields: [
        defineField({ name: "lede", type: "text", rows: 2 }),
        defineField({ name: "support", type: "text", rows: 3 }),
      ],
    }),
    defineField({
      name: "credentials",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "label", type: "string" }),
            defineField({ name: "value", type: "string" }),
            defineField({ name: "detail", type: "string" }),
          ],
        }),
      ],
    }),
    defineField({
      name: "story",
      type: "object",
      fields: [
        defineField({
          name: "heritage",
          type: "array",
          of: [{ type: "block" }],
          description: "First paragraph renders as the serif lead (§8.3).",
        }),
        defineField({
          name: "footprint",
          type: "array",
          of: [{ type: "string" }],
          description: "Pending brand-guide confirmation (§15.8).",
        }),
        defineField({
          name: "footprintNow",
          type: "string",
          description: "The highlighted closing stop, \"Now, Richmond\".",
        }),
        defineField({
          name: "richmond",
          type: "array",
          of: [{ type: "block" }],
          description: "First paragraph renders as the serif lead (§8.3).",
        }),
        defineField({
          name: "philosophy",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({ name: "title", type: "string" }),
                defineField({ name: "line", type: "text", rows: 2 }),
                defineField({
                  name: "image",
                  type: "image",
                  options: { hotspot: true },
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "chef",
      type: "object",
      fields: [
        defineField({
          name: "portrait",
          type: "image",
          options: { hotspot: true },
          description: "Kitchen setting, not a studio headshot (§8.3).",
        }),
        defineField({
          name: "intro",
          type: "string",
          description: "Heading line; \\n breaks, *word* italic champagne.",
        }),
        defineField({
          name: "awards",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({ name: "title", type: "string" }),
                defineField({ name: "detail", type: "string" }),
                defineField({
                  name: "years",
                  type: "string",
                  description: "Ranges written \"2022 to 2025\" (§8.1).",
                }),
              ],
            }),
          ],
        }),
        defineField({ name: "bio", type: "text", rows: 3 }),
        defineField({
          name: "moments",
          type: "array",
          of: [{ type: "string" }],
          description: "Notable Moments beside His Story (§8.3 item 3).",
        }),
        defineField({
          name: "quote",
          type: "text",
          rows: 2,
          description: "Placeholder pending the chef interview (§8.3 item 4).",
        }),
      ],
    }),
    defineField({
      name: "privateDining",
      type: "object",
      description: "The landing preview (§8.3 item 4); facts differ from banquet's.",
      fields: [
        defineField({ name: "copy", type: "text", rows: 3 }),
        defineField({ name: "facts", type: "array", of: [{ type: "fact" }] }),
      ],
    }),
    defineField({
      name: "banquet",
      type: "object",
      fields: [
        defineField({ name: "copy", type: "text", rows: 3 }),
        defineField({ name: "facts", type: "array", of: [{ type: "fact" }] }),
        defineField({
          name: "occasions",
          type: "array",
          of: [{ type: "string" }],
        }),
        defineField({
          name: "menus",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({ name: "label", type: "string" }),
                defineField({ name: "line", type: "string" }),
                defineField({ name: "detail", type: "string" }),
              ],
            }),
          ],
        }),
        defineField({
          name: "enquiryTarget",
          type: "string",
          description: "Enquire Now target; /dining/reserve until a flow exists.",
        }),
      ],
    }),
    defineField({
      name: "reserve",
      type: "object",
      fields: [
        defineField({
          name: "openTableUrl",
          type: "url",
          description: "Absent until the OpenTable account is live (§15.3).",
        }),
        defineField({ name: "phone", type: "string" }),
        defineField({ name: "wechat", type: "string" }),
        defineField({
          name: "hours",
          type: "array",
          of: [{ type: "string" }],
          description: "Service windows; separate business from siteSettings hours.",
        }),
        defineField({
          name: "address",
          type: "object",
          fields: [
            defineField({ name: "name", type: "string" }),
            defineField({ name: "line", type: "string" }),
          ],
        }),
      ],
    }),
    defineField({
      name: "socials",
      type: "array",
      of: [{ type: "navLink" }],
      description: "Info strip links (§8.2); stubs until the accounts land.",
    }),
    defineField({ name: "seo", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Crystal Jade Palace" }) },
});
