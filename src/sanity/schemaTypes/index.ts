import type { SchemaTypeDefinition } from "sanity";
import { dish } from "./dish";
import { event } from "./event";
import { homePage } from "./homePage";
import { newsPost } from "./newsPost";
import { fact, navLink, seo } from "./objects";
import { promotion } from "./promotion";
import { restaurant } from "./restaurant";
import { siteSettings } from "./siteSettings";
import { zone } from "./zone";

/**
 * Content schemas (docs §11.4): three singletons (siteSettings, homePage,
 * restaurant), the nine-zone list, dishes, and the three news types, plus the
 * shared objects.
 */
export const schemaTypes: SchemaTypeDefinition[] = [
  // objects
  seo,
  navLink,
  fact,
  // singletons
  siteSettings,
  homePage,
  restaurant,
  // collections
  zone,
  dish,
  event,
  promotion,
  newsPost,
];
