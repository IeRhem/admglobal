export function parseISO8601Duration(duration: string): string {
  const hours = Number(duration.match(/(\d+)H/)?.[1] ?? 0);
  const minutes = Number(duration.match(/(\d+)M/)?.[1] ?? 0);
  const seconds = Number(duration.match(/(\d+)S/)?.[1] ?? 0);

  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function parseISO8601DurationInSeconds(duration: string): number {
  const hours = Number(duration.match(/(\d+)H/)?.[1] ?? 0);
  const minutes = Number(duration.match(/(\d+)M/)?.[1] ?? 0);
  const seconds = Number(duration.match(/(\d+)S/)?.[1] ?? 0);

  return hours * 3600 + minutes * 60 + seconds;
}

export function parseVideoDurationInSeconds(duration: string): number {
  const parts = duration.split(":").map(Number);

  if (parts.some((part) => Number.isNaN(part)) || parts.length < 2) {
    return 0;
  }

  return parts.length === 3
    ? parts[0] * 3600 + parts[1] * 60 + parts[2]
    : parts[0] * 60 + parts[1];
}

export function isLongFormDuration(duration: string): boolean {
  return parseVideoDurationInSeconds(duration) > 180;
}

export function formatDateForVideo(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid YouTube publish date: ${dateString}`);
  }

  return date.toISOString().slice(0, 10);
}

export function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export type RetryOptions = {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
};

export async function fetchWithRetry(
  url: string,
  options: RetryOptions = {},
): Promise<Response> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
  } = options;

  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await fetch(url, { cache: "no-store" });

      if (response.ok) {
        return response;
      }

      const shouldRetry = response.status === 429 || response.status >= 500;
      if (!shouldRetry || attempt === maxRetries) {
        return Promise.reject(
          new Error(
            `YouTube API request failed (${response.status} ${response.statusText})`,
          ),
        );
      }

      const retryAfter = Number(response.headers.get("Retry-After"));
      const waitTime =
        Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : delay;

      await sleep(waitTime);
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      await sleep(delay);
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw new Error("YouTube API request failed after all retries");
}
