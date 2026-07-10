import type { StructureResolver } from "sanity/structure";

/** The three §11.4 singletons, pinned to fixed document ids. */
const SINGLETONS = [
  { type: "siteSettings", id: "siteSettings", title: "Site Settings" },
  { type: "homePage", id: "homePage", title: "Home Page" },
  { type: "restaurant", id: "restaurant", title: "Crystal Jade Palace" },
];

/**
 * Studio desk structure (docs §11.4): singletons pinned at the top, ordered
 * zone and dish lists, then the three news types under Content Operations.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      ...SINGLETONS.map((singleton) =>
        S.listItem()
          .title(singleton.title)
          .id(singleton.id)
          .child(
            S.document()
              .schemaType(singleton.type)
              .documentId(singleton.id),
          ),
      ),
      S.divider(),
      S.listItem()
        .title("Spaces")
        .child(
          S.documentTypeList("zone")
            .title("Spaces")
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),
      S.listItem()
        .title("Dishes")
        .child(
          S.documentTypeList("dish")
            .title("Dishes")
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),
      S.divider(),
      S.documentTypeListItem("event").title("Events"),
      S.documentTypeListItem("promotion").title("Promotions"),
      S.documentTypeListItem("newsPost").title("News Posts"),
    ]);
