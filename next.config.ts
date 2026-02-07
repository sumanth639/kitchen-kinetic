import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // ignoreBuildErrors: true, 
  },
  eslint: {
    // ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "forkify-api.herokuapp.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Ignore optional dependencies that cause warnings
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@opentelemetry/exporter-jaeger": false,
      "@genkit-ai/firebase": false,
    };

    // Ignore handlebars require.extensions warnings
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /node_modules\/handlebars\/lib\/index\.js/ },
    ];

    return config;
  },
};

export default nextConfig;
