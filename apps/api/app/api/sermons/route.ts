import { getStoredYouTubeVideos } from "@/app/lib/youtube-videos";

export async function GET() {
  try {
    const videos = await getStoredYouTubeVideos();
    return Response.json(videos, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Failed to load stored YouTube videos:", error);
    return Response.json(
      { error: "Unable to load sermons" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
