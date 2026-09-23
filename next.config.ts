import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Without this, Turbopack walks up to /Users/dendense and picks up an unrelated lockfile.
    root: process.cwd(),
  },
  images: {
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
