import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The offline trade-show intake app is a static bundle in public/show/.
  async redirects() {
    return [
      { source: "/show", destination: "/show/index.html", permanent: false },
    ];
  },
};

export default nextConfig;
