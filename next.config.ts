import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow avif/webp from the local public folder (no external domains needed)
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
