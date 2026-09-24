import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Without this, Turbopack walks up to /Users/dendense and picks up an unrelated lockfile.
    root: process.cwd(),
  },
  images: {
    // Next only serves qualities explicitly allowed here. 85 is used by the
    // gallery cards; 75 stays as the default for everything else.
    qualities: [75, 85],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.imgur.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
