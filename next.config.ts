import type { NextConfig } from "next";
import { CRYSTAL_JADE_URL } from "./src/lib/site";

// A production deploy without the Crystal Jade origin would ship real users
// links and redirects to the in-code placeholder host. Fail the build loudly
// instead. Keyed on VERCEL_ENV because NODE_ENV is "production" for every
// `next build`, including previews; preview and development keep the silent
// fallback by design.
if (
  process.env.VERCEL_ENV === "production" &&
  !process.env.NEXT_PUBLIC_CRYSTAL_JADE_URL
) {
  throw new Error(
    "NEXT_PUBLIC_CRYSTAL_JADE_URL is not set. Production builds refuse the " +
      "placeholder Crystal Jade host; set the variable to the standalone " +
      "site's origin before deploying.",
  );
}

const nextConfig: NextConfig = {
  // Sanity Studio renders with styled-components; enable the SWC transform.
  compiler: { styledComponents: true },
  images: {
    // Sanity CDN (docs §11.1). Real project host resolves once projectId is set.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  // The retired /dining routes hand off to the standalone Crystal Jade site.
  // Temporary 307 by ruling: the destination is a placeholder host; flip to
  // permanent only after the domain is final and the standalone site is
  // verified live (design.md §15 item 11).
  async redirects() {
    return [
      { source: "/dining", destination: CRYSTAL_JADE_URL, permanent: false },
      {
        source: "/dining/:path*",
        destination: `${CRYSTAL_JADE_URL}/:path*`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
