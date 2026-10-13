import {
  getStoredYouTubeVideos,
  refreshYouTubeVideos,
} from "@/app/lib/youtube-videos";

export async function GET() {
  try {
    let videos = await getStoredYouTubeVideos();

    if (videos.length === 0) {
      try {
        await refreshYouTubeVideos();
        videos = await getStoredYouTubeVideos();
      } catch (refreshErr) {
        console.error("Auto-refresh of YouTube sermons failed:", refreshErr);
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
