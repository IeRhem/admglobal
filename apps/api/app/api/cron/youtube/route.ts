import { refreshYouTubeVideos } from "@/app/lib/youtube-videos";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("CRON_SECRET is not configured");
    return Response.json(
      { error: "Cron endpoint is not configured" },
      { status: 500 },
    );
  }

  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const count = await refreshYouTubeVideos();
    return Response.json({ updated: count });
  } catch (error) {
    console.error("Failed to refresh YouTube videos:", error);
    return Response.json(
      { error: "Unable to refresh YouTube videos" },
      { status: 500 },
    );
  }
}
