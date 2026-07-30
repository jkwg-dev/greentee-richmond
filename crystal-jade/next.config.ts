import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the project root to this folder. Without it, Turbopack walks up,
  // finds the parent repo's lockfile while we are nested, and treats the
  // GreenTee app as part of this build. Harmless after extraction; required
  // for the standalone rule while nested.
  turbopack: { root: __dirname },
  images: {
    // Sanity CDN, for when the separate Crystal Jade Sanity project is wired
    // in. Until then no remote images render; placeholder frames only.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
