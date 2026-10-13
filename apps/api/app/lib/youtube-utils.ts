import https from "node:https";

export function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function directHttpsGet(urlStr: string): Promise<Response> {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlStr);
      const req = https.request(
        url,
        {
          method: "GET",
          family: 4,
          headers: {
            "User-Agent": "ADMI-Backend/1.0",
            Accept: "application/json",
          },
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (chunk) => chunks.push(chunk));
          res.on("end", () => {
            const body = Buffer.concat(chunks);
            resolve(
              new Response(body, {
                status: res.statusCode || 200,
                statusText: res.statusMessage || "OK",
                headers: res.headers as Record<string, string>,
              }),
            );
          });
        },
      );
      req.on("error", reject);
      req.setTimeout(15000, () => {
        req.destroy(new Error("Request timeout"));
      });
      req.end();
    } catch (err) {
      reject(err);
    }
  });
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
      const response = await directHttpsGet(url).catch(() =>
        fetch(url, { cache: "no-store" }),
      );

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
