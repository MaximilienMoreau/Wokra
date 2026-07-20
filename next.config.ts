import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // GitHub OAuth profile pictures.
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      // Vercel Blob — post image uploads.
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  experimental: {
    serverActions: {
      // Default 1MB is too small for post image uploads via a Server Action.
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
