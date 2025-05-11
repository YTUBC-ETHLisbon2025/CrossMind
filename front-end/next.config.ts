import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    // Allows importing `.md` files directly
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    });
    return config;
  },
};

export default nextConfig;
