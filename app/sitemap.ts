import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: env.SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${env.SITE_URL}/search`, changeFrequency: "weekly", priority: 0.5 },
  ];
}
