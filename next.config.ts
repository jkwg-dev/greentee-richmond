import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sanity Studio renders with styled-components; enable the SWC transform.
  compiler: { styledComponents: true },
  images: {
    // Sanity CDN (docs §11.1). Real project host resolves once projectId is set.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
