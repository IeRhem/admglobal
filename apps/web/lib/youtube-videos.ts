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

export async function getYouTubeVideos(): Promise<YouTubeVideo[]> {
  const apiUrl = process.env.ADMI_API_URL;
  if (!apiUrl) {
    throw new Error("ADMI_API_URL is required to load sermons");
  }

  const response = await fetch(new URL("/sermons", apiUrl), {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(
      `Sermon API request failed (${response.status} ${response.statusText})`,
    );
  }

  return z.array(youtubeVideoSchema).parse(await response.json());
}
