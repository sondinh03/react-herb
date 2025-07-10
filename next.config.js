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
        pathname: "/spring_herb/**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    return config;
  },

  async headers() {
    return [
      {
        source: "/pdf.worker.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
