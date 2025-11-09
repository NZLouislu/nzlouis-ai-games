import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 优化性能配置
  reactStrictMode: true,
  
  // 启用 SWC 压缩
  swcMinify: true,
  
  // 优化图片加载
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  // 优化生产构建
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
