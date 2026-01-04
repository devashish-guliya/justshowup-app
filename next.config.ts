import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static image imports
  images: {
    unoptimized: true,
  },
  
  // Ignore TypeScript errors during build for demo mode
  typescript: {
    ignoreBuildErrors: process.env.DEMO_MODE === 'true',
  },
};

export default nextConfig;
