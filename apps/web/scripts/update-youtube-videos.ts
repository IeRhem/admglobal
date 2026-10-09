import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { existsSync } from "node:fs";
import { fetchYouTubeVideos } from "@/lib/fetch-youtube-videos";

type CliOptions = { maxResults: number };

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(
      "Usage: npm run update-youtube-videos -- [--all | --max=<number>]",
    );
    process.exit(0);
  }

  const maxArg = args.find((argument) => argument.startsWith("--max="));
  const maxResults = args.includes("--all")
    ? Number.MAX_SAFE_INTEGER
    : maxArg
      ? Number(maxArg.split("=")[1])
      : 50;

  if (!Number.isInteger(maxResults) || maxResults < 1) {
    throw new Error("--max must be a positive integer");
  }

  return { maxResults };
}

function loadEnvironment(): void {
  if (!process.loadEnvFile) {
    return;
  }

  if (existsSync(".env")) {
    process.loadEnvFile(".env");
  }
  if (existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  }
}

function formatDataFile(
  videos: Awaited<ReturnType<typeof fetchYouTubeVideos>>,
): string {
  return `import type { YouTubeVideo } from "@/lib/fetch-youtube-videos";\n\nexport const youTubeVideos: YouTubeVideo[] = ${JSON.stringify(videos, null, 2)};\n`;
}

async function main(): Promise<void> {
  loadEnvironment();
  const { maxResults } = parseArgs();
  const videos = await fetchYouTubeVideos({
    apiKey: process.env.YOUTUBE_API_KEY ?? "",
    channelId: process.env.YOUTUBE_CHANNEL_ID ?? "",
    maxResults,
  });
  const filePath = resolve(process.cwd(), "data/youtubevideos.ts");

  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, formatDataFile(videos), "utf8");
  console.log(`Updated ${videos.length} videos in ${filePath}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
