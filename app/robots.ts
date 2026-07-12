import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { PROTECTED_PREFIXES } from "@/lib/protected-routes";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api", "/onboarding", ...PROTECTED_PREFIXES],
    },
    sitemap: `${env.SITE_URL}/sitemap.xml`,
  };
}
