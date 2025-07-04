/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/duoclieu",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8081",
        pathname: "/api/files/**",
      },
      {
        protocol: "https",
        hostname: "ext.vnua.edu.vn",
        pathname: "/spring_herb/herb/**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },
};

module.exports = nextConfig;