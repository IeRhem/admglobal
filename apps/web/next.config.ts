import type { NextConfig } from "next";

const remotePatterns: Array<{
  protocol: "http" | "https";
  hostname: string;
  port?: string;
}> = [
  {
    protocol: "http",
    hostname: "localhost",
  },
  {
    protocol: "http",
    hostname: "127.0.0.1",
  },
  {
    protocol: "https",
    hostname: "i.ytimg.com",
  },
  {
    protocol: "https",
    hostname: "img.youtube.com",
  },
  {
    protocol: "https",
    hostname: "*.r2.cloudflarestorage.com",
  },
  {
    protocol: "https",
    hostname: "*.r2.dev",
  },
];

if (process.env.ADMI_API_URL) {
  try {
    const url = new URL(process.env.ADMI_API_URL);
    const protocol = url.protocol.replace(":", "") as "http" | "https";
    const port = url.port || undefined;
    if (
      (protocol === "http" || protocol === "https") &&
      !remotePatterns.some(
        (pattern) =>
          pattern.hostname === url.hostname &&
          pattern.protocol === protocol &&
          pattern.port === port,
      )
    ) {
      remotePatterns.push({
        protocol,
        hostname: url.hostname,
        port,
      });
    }
  } catch {
    // Ignore invalid URL
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    ADMI_API_URL: process.env.ADMI_API_URL || "/api",
  },
  images: {
    remotePatterns,
  },
  transpilePackages: ["@repo/ui"],
  experimental: {
    agentFeedback: true,
    agentUpgrade: "security",
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
