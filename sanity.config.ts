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
  basePath: "/studio",
  // "unconfigured" keeps the route mounting before credentials land; the
  // Studio is unusable until NEXT_PUBLIC_SANITY_PROJECT_ID is real (§11.5).
  projectId: projectId || "unconfigured",
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({ structure }),
    presentationTool({
      previewUrl: { previewMode: { enable: "/api/draft-mode/enable" } },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
