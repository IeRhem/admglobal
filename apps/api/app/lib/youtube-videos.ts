import { fetchWithRetry, sleep } from "./youtube-utils";
import { asc, db, youtube_video } from "@repo/database";

export type YouTubeVideo = {
  videoId: string;
  title: string;
  link: string;
  timeLength: string;
  datePosted: string;
  featuredImg: string;
};

type YouTubeApiResponse<T> = {
  items?: T[];
  nextPageToken?: string;
  error?: { message?: string };
};

type PlaylistItem = {
  snippet?: { resourceId?: { videoId?: string } };
};

type VideoItem = {
  id: string;
  snippet?: {
    title?: string;
    publishedAt?: string;
    thumbnails?: {
      maxres?: { url: string };
      high?: { url: string };
      medium?: { url: string };
    };
  };
  contentDetails?: { duration?: string };
};

function youtubeUrl(resource: string, params: Record<string, string>): string {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${resource}`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.set(key, value),
  );
  return url.toString();
}

async function getJson<T>(url: string): Promise<YouTubeApiResponse<T>> {
  const response = await fetchWithRetry(url);
  const data = (await response.json()) as YouTubeApiResponse<T>;

  if (data.error?.message) {
    throw new Error(`YouTube API error: ${data.error.message}`);
  }

  return data;
}

function parseDuration(duration: string): number {
  const hours = Number(duration.match(/(\d+)H/)?.[1] ?? 0);
  const minutes = Number(duration.match(/(\d+)M/)?.[1] ?? 0);
  const seconds = Number(duration.match(/(\d+)S/)?.[1] ?? 0);

  return hours * 3600 + minutes * 60 + seconds;
}

function formatDuration(duration: string): string {
  const hours = Number(duration.match(/(\d+)H/)?.[1] ?? 0);
  const minutes = Number(duration.match(/(\d+)M/)?.[1] ?? 0);
  const seconds = Number(duration.match(/(\d+)S/)?.[1] ?? 0);

  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid YouTube publish date: ${dateString}`);
  }
  return date.toISOString().slice(0, 10);
}

async function resolveChannelId(
  channelIdOrHandle: string,
  apiKey: string,
): Promise<string> {
  if (!channelIdOrHandle.startsWith("@")) {
    return channelIdOrHandle;
  }

  const response = await getJson<{ id?: { channelId?: string } }>(
    youtubeUrl("search", {
      part: "snippet",
      q: channelIdOrHandle,
      type: "channel",
      maxResults: "1",
      key: apiKey,
    }),
  );
  const resolvedId = response.items?.[0]?.id?.channelId;

  if (!resolvedId) {
    throw new Error(
      `Could not find a YouTube channel for ${channelIdOrHandle}`,
    );
  }

  return resolvedId;
}

export async function fetchYouTubeVideos({
  apiKey,
  channelId,
  maxResults = 50,
  pageDelay = 500,
}: {
  apiKey: string;
  channelId: string;
  maxResults?: number;
  pageDelay?: number;
}): Promise<YouTubeVideo[]> {
  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY is required");
  }
  if (!channelId) {
    throw new Error("YOUTUBE_CHANNEL_ID is required");
  }
  if (!Number.isInteger(maxResults) || maxResults < 1) {
    throw new Error("maxResults must be a positive integer");
  }

  const actualChannelId = await resolveChannelId(channelId, apiKey);
  const channelResponse = await getJson<{
    contentDetails?: { relatedPlaylists?: { uploads?: string } };
  }>(
    youtubeUrl("channels", {
      part: "contentDetails",
      id: actualChannelId,
      key: apiKey,
    }),
  );
  const uploadsPlaylistId =
    channelResponse.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

  if (!uploadsPlaylistId) {
    throw new Error(
      `Could not find the uploads playlist for ${actualChannelId}`,
    );
  }

  const videos: YouTubeVideo[] = [];
  let nextPageToken: string | undefined;

  do {
    const playlistResponse = await getJson<PlaylistItem>(
      youtubeUrl("playlistItems", {
        part: "snippet",
        playlistId: uploadsPlaylistId,
        maxResults: "50",
        ...(nextPageToken ? { pageToken: nextPageToken } : {}),
        key: apiKey,
      }),
    );
    const videoIds = (playlistResponse.items ?? [])
      .map((item) => item.snippet?.resourceId?.videoId)
      .filter((id): id is string => Boolean(id));

    if (videoIds.length > 0) {
      const videoResponse = await getJson<VideoItem>(
        youtubeUrl("videos", {
          part: "snippet,contentDetails",
          id: videoIds.join(","),
          key: apiKey,
        }),
      );

      for (const video of videoResponse.items ?? []) {
        const snippet = video.snippet;
        const duration = video.contentDetails?.duration;
        const thumbnail =
          snippet?.thumbnails?.maxres?.url ??
          snippet?.thumbnails?.high?.url ??
          snippet?.thumbnails?.medium?.url;

        if (
          !snippet?.title ||
          !snippet.publishedAt ||
          !duration ||
          !thumbnail ||
          parseDuration(duration) <= 180
        ) {
          continue;
        }

        videos.push({
          videoId: video.id,
          title: snippet.title,
          link: `https://www.youtube.com/watch?v=${video.id}`,
          timeLength: formatDuration(duration),
          datePosted: formatDate(snippet.publishedAt),
          featuredImg: thumbnail,
        });
      }
    }

    nextPageToken = playlistResponse.nextPageToken;
    if (nextPageToken && videos.length < maxResults) {
      await sleep(pageDelay);
    }
  } while (nextPageToken && videos.length < maxResults);

  return videos.slice(0, maxResults);
}

export async function refreshYouTubeVideos(): Promise<number> {
  const videos = await fetchYouTubeVideos({
    apiKey: process.env.YOUTUBE_API_KEY ?? "",
    channelId: process.env.YOUTUBE_CHANNEL_ID ?? "",
  });

  if (videos.length === 0) {
    throw new Error("YouTube returned no eligible sermon videos");
  }

  await db.transaction(async (tx) => {
    await tx.delete(youtube_video);
    await tx.insert(youtube_video).values(
      videos.map((video, index) => ({
        videoId: video.videoId,
        title: video.title,
        link: video.link,
        timeLength: video.timeLength,
        datePosted: video.datePosted,
        featuredImg: video.featuredImg,
        position: index,
      })),
    );
  });

  return videos.length;
}

export async function getStoredYouTubeVideos(): Promise<YouTubeVideo[]> {
  const rows = await db
    .select()
    .from(youtube_video)
    .orderBy(asc(youtube_video.position));

  return rows.map((video) => ({
    videoId: video.videoId,
    title: video.title,
    link: video.link,
    timeLength: video.timeLength,
    datePosted: video.datePosted,
    featuredImg: video.featuredImg,
  }));
}
