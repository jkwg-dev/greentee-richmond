import { defineField, defineType } from "sanity";

/**
 * Crystal Jade Palace menu dish (docs §4.1). Seasonal menu updates are pure
 * content edits (§4.3). Placeholder frame tints stay in the UI layer (§11.4).
 */
export const dish = defineType({
  name: "dish",
  title: "Dish",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "zhName",
      title: "中文 name",
      type: "string",
      description: "Rendered in the system zh stack (§2.2).",
    }),
    defineField({
      name: "line",
      type: "string",
      description: "One line under the name.",
    }),
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
      description:
        "Cropped 16:10 on the menu and 4:5 in the landing trio. 1600×1200 or larger with the dish centered; set the hotspot.",
    }),
    defineField({
      name: "category",
      type: "string",
      options: {
        list: [
          { title: "Dim Sum", value: "dimsum" },
          { title: "Roasted Meats", value: "roast" },
          { title: "Seafood", value: "seafood" },
          { title: "Mains", value: "mains" },
          { title: "Desserts", value: "desserts" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "seasonal", type: "boolean", initialValue: false }),
    defineField({ name: "available", type: "boolean", initialValue: true }),
    defineField({
      name: "order",
      type: "number",
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: "Menu order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "category" },
  },
});
