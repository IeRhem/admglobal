import {
  fetchWithRetry,
  formatDateForVideo,
  parseISO8601Duration,
  parseISO8601DurationInSeconds,
  sleep,
} from "@/lib/utils/youtube-utils";

export type YouTubeVideo = {
  id: number;
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

type FetchYouTubeVideosOptions = {
  apiKey: string;
  channelId: string;
  maxResults?: number;
  pageDelay?: number;
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
}: FetchYouTubeVideosOptions): Promise<YouTubeVideo[]> {
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
          parseISO8601DurationInSeconds(duration) <= 180
        ) {
          continue;
        }

        videos.push({
          id: videos.length + 1,
          title: snippet.title,
          link: `https://www.youtube.com/watch?v=${video.id}`,
          timeLength: parseISO8601Duration(duration),
          datePosted: formatDateForVideo(snippet.publishedAt),
          featuredImg: thumbnail,
        });
      }
    }

    nextPageToken = playlistResponse.nextPageToken;
    if (nextPageToken && videos.length < maxResults) {
      await sleep(pageDelay);
    }
  } while (nextPageToken && videos.length < maxResults);

  return videos.slice(0, maxResults).map((video, index) => ({
    ...video,
    id: index + 1,
  }));
}
