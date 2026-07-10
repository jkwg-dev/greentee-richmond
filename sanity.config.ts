"use client";

/**
 * Embedded Studio config, mounted at /studio (docs §3.3, §11.1). The route is
 * noindex (see src/app/studio/layout.tsx).
 */
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { schemaTypes } from "@/sanity/schemaTypes";
import { structure } from "@/sanity/structure";

export default defineConfig({
  // Embedded at /studio in the Next app; the hosted sanity.studio build
  // overrides the base path to "/" via SANITY_STUDIO_BASEPATH.
  basePath: process.env.SANITY_STUDIO_BASEPATH || "/studio",
  // "unconfigured" keeps the route mounting before credentials land; the
  // Studio is unusable until NEXT_PUBLIC_SANITY_PROJECT_ID is real (§11.5).
  projectId: projectId || "unconfigured",
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({ structure }),
    presentationTool({
      previewUrl: {
        // The hosted Studio previews an absolute site origin; the embedded
        // Studio stays same-origin.
        origin: process.env.SANITY_STUDIO_PREVIEW_ORIGIN || "same-origin",
        previewMode: { enable: "/api/draft-mode/enable" },
      },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
