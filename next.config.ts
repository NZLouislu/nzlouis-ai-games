import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize performance configuration
  reactStrictMode: true,
  


  
  // Optimize image loading
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  // Optimize production build
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
