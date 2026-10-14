import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo-config";

/**
 * Dynamic sitemap for search engine crawlers.
 * Includes all static pages. Dynamic pages (events, testimonies) would
 * be added here when their listing APIs are available at build time.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = [
    { url: "/", priority: 1.0, changeFrequency: "weekly" as const },
    { url: "/about", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/sermons", priority: 0.8, changeFrequency: "daily" as const },
    { url: "/events", priority: 0.8, changeFrequency: "weekly" as const },
    { url: "/testimonies", priority: 0.7, changeFrequency: "weekly" as const },
    { url: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
    { url: "/give", priority: 0.6, changeFrequency: "monthly" as const },
    { url: "/testify", priority: 0.5, changeFrequency: "monthly" as const },
  ];

  return staticPages.map((page) => ({
    url: `${SITE_URL}${page.url}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
