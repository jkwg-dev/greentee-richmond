import type { NextConfig } from "next";
import { CRYSTAL_JADE_URL } from "./src/lib/site";

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
