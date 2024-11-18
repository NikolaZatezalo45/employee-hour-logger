import withPWA from "next-pwa";
import type { NextConfig } from "next";

// Base Next.js configuration
const baseConfig: NextConfig = {
  reactStrictMode: true, // Next.js-specific option
};

// Wrap withPWA to add PWA functionality
const nextConfig = withPWA({
  pwa: {
    dest: "public", // Directory for service worker files
    register: true, // Automatically register service worker
    skipWaiting: true, // Activate updated service worker immediately
  },
});

// Export combined configuration
export default {
  ...nextConfig, // PWA configuration
  ...baseConfig, // Base Next.js configuration
};
