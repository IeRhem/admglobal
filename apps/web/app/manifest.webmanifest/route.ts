import { NextResponse } from "next/server";
import {
  SITE_URL,
  CHURCH_NAME,
  CHURCH_SHORT_DESCRIPTION,
} from "@/lib/seo-config";

/**
 * Web app manifest for PWA support and richer search results.
 * Accessible at /manifest.webmanifest
 */
export function GET() {
  const manifest = {
    name: "Arrow of Deliverance Ministries International",
    short_name: CHURCH_NAME,
    description: CHURCH_SHORT_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#EAB308",
    icons: [
      {
        src: "/admi-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
    },
  });
}
