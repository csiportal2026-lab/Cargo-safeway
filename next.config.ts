import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/about", destination: "/leadership", permanent: true },
    ];
  },
};

export default nextConfig;
