import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client } from "@/sanity/lib/client";

/**
 * Presentation-tool entry point (docs §11.5): the Studio opens the site
 * through this route, which validates the preview URL secret against the
 * project and enables Next Draft Mode so `sanityFetch` switches to the drafts
 * perspective.
 */
export const { GET } = client
  ? defineEnableDraftMode({
      client: client.withConfig({ token: process.env.SANITY_API_READ_TOKEN }),
    })
  : {
      GET: async () =>
        new Response("Sanity is not configured", { status: 503 }),
    };
