import {
  getStoredYouTubeVideos,
  refreshYouTubeVideos,
} from "@/app/lib/youtube-videos";

let inFlightRefresh: Promise<number> | null = null;
let lastRefreshFailure = 0;
const REFRESH_BACKOFF_MS = 60_000;

export async function GET() {
  try {
    let videos = await getStoredYouTubeVideos();

    if (videos.length === 0) {
      const now = Date.now();
      if (now - lastRefreshFailure < REFRESH_BACKOFF_MS) {
        return Response.json(
          { error: "Unable to load sermons" },
          { status: 503, headers: { "Cache-Control": "no-store" } },
        );
      }

      try {
        if (!inFlightRefresh) {
          inFlightRefresh = refreshYouTubeVideos().finally(() => {
            inFlightRefresh = null;
          });
        }
        await inFlightRefresh;
        videos = await getStoredYouTubeVideos();
      } catch (refreshErr) {
        lastRefreshFailure = Date.now();
        console.error("Auto-refresh of YouTube sermons failed:", refreshErr);
        return Response.json(
          { error: "Unable to load sermons" },
          { status: 503, headers: { "Cache-Control": "no-store" } },
        );
      }
    }

    return Response.json(videos, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Failed to load stored YouTube videos:", error);
    return Response.json(
      { error: "Unable to load sermons" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
