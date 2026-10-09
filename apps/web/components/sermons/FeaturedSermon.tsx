import type { YouTubeVideo } from "@/lib/youtube-videos";
import { isLongFormDuration } from "@/lib/utils/youtube-utils";
import { IconArrowUpRight, IconPlayerPlay } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";

type FeaturedSermonProps = {
  videos: YouTubeVideo[];
};

function sortByDate(videos: YouTubeVideo[]) {
  return [...videos].sort(
    (a, b) =>
      new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime(),
  );
}

function formatDate(datePosted: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(`${datePosted}T00:00:00`),
  );
}

function RecentSermonCard({ video }: { video: YouTubeVideo }) {
  return (
    <Link
      href={video.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 rounded-xl border border-border bg-card p-2 shadow-sm transition-all duration-300 hover:shadow-md"
      aria-label={`Watch ${video.title} on YouTube`}
    >
      <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-muted">
        <Image
          src={video.featuredImg}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
        <span className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium text-foreground backdrop-blur-sm">
          <IconPlayerPlay className="size-2.5 fill-current" />
          {video.timeLength}
        </span>
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-1">
        <p className="text-[10px] font-bold uppercase text-muted-foreground">
          {formatDate(video.datePosted)}
        </p>
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors duration-300 group-hover:text-primary">
          {video.title}
        </p>
      </div>
    </Link>
  );
}

export function FeaturedSermon({ videos }: FeaturedSermonProps) {
  const longForm = sortByDate(
    videos.filter((v) => isLongFormDuration(v.timeLength)),
  );

  const featured = longForm[0];
  const recent = longForm.slice(1, 4);

  if (!featured) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
        <h2 className="font-heading text-2xl font-semibold">
          Sermons are coming soon
        </h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          New messages will appear here as soon as the YouTube library is
          updated.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Eyebrow + heading */}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h3 className="mb-2 text-lg font-heading tracking-widest text-primary">
            Latest sermon
          </h3>
          <h2 className="font-heading text-3xl font-bold leading-tight md:text-4xl">
            Keep growing in the Word.
          </h2>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Hero featured video */}
        <Link
          href={featured.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md"
          aria-label={`Watch ${featured.title} on YouTube`}
        >
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={featured.featuredImg}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-background/95 via-background/20 to-transparent" />

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-background">
                <IconPlayerPlay className="size-6 translate-x-0.5 fill-current" />
              </span>
            </div>

            {/* Info overlay */}
            <div className="absolute inset-x-0 bottom-0 p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-md bg-primary/30 border border-primary/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-foreground">
                  {featured.timeLength}
                </span>
                <span className="text-xs font-medium text-white/70">
                  {formatDate(featured.datePosted)}
                </span>
              </div>
              <h3 className="font-heading text-xl font-bold leading-snug text-white drop-shadow-sm md:text-2xl">
                {featured.title}
              </h3>
            </div>
          </div>
        </Link>

        {/* Sidebar */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold uppercase text-muted-foreground">
            Also recent
          </h4>

          <div className="flex flex-col gap-2">
            {recent.map((video) => (
              <RecentSermonCard key={video.link} video={video} />
            ))}
          </div>

          <div className="mt-auto pt-2">
            <Link
              href="/sermons"
              className={cn(buttonVariants({ size: "lg" }), "w-fit h-fit mx-auto pr-1 py-1! flex justify-between")}
            >
              Explore all sermons
              <span
                aria-hidden="true"
                className={cn(buttonVariants({ size: "icon-lg" }), "bg-white")}
              >
                <IconArrowUpRight className="size-5 text-primary" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
