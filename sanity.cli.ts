import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "@/sanity/env";

export default defineCliConfig({
  api: { projectId, dataset },
  deployment: { appId: "tp5bu3rbdhvio0dcl9palvky" },
  /** sanity.studio hostname for the hosted deploy (pnpm studio:deploy). */
  studioHost: process.env.SANITY_STUDIO_HOSTNAME || "greentee-richmond",
});
