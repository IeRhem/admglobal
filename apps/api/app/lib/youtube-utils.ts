export function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function fetchWithRetry(
  url: string,
  {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
  }: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
  } = {},
): Promise<Response> {
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await fetch(url, { cache: "no-store" });

      if (response.ok) return response;

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
      if (attempt === maxRetries) throw error;

      await sleep(delay);
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw new Error("YouTube API request failed after all retries");
}
