import { z } from "zod";

const youtubeVideoSchema = z.object({
  videoId: z.string(),
  title: z.string(),
  link: z.url(),
  timeLength: z.string(),
  datePosted: z.string(),
  featuredImg: z.url(),
});

export type YouTubeVideo = z.infer<typeof youtubeVideoSchema>;

function buildApiUrl(endpoint: string, base: string) {
  const cleanBase = base.replace(/\/+$/, "");
  const cleanEndpoint = endpoint.replace(/^\/+/, "");
  if (cleanBase.endsWith("/api") && cleanEndpoint.startsWith("api/")) {
    return `${cleanBase}/${cleanEndpoint.slice(4)}`;
  }
  return `${cleanBase}/${cleanEndpoint}`;
}

export async function getYouTubeVideos(): Promise<YouTubeVideo[]> {
  const apiUrl = process.env.INTERNAL_API_URL || process.env.ADMI_API_URL;
  if (!apiUrl) {
    console.warn("API URL is not configured to load sermons");
    return [];
  }

  try {
    const targetUrl = buildApiUrl("/api/sermons", apiUrl);
    const response = await fetch(targetUrl, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error(
        `Sermon API request failed (${response.status} ${response.statusText})`,
      );
      return [];
    }

    const json = await response.json();
    return z.array(youtubeVideoSchema).parse(json);
  } catch (error) {
    console.error("Failed to load sermons from API:", error);
    return [];
  }
}
