import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo-config";

/**
 * Generates robots.txt allowing all crawlers to index the site,
 * and pointing them to the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
