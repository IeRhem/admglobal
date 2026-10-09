"use client";

import type { YouTubeVideo } from "@/lib/youtube-videos";
import { IconPlayerPlay, IconSearch } from "@tabler/icons-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { isLongFormDuration } from "@/lib/utils/youtube-utils";
import Link from "next/link";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

type SermonLibraryProps = {
  videos: YouTubeVideo[];
};

export function sortByDate(videos: YouTubeVideo[]) {
  return [...videos].sort(
    (a, b) =>
      new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime(),
  );
}

export function formatDate(datePosted: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(`${datePosted}T00:00:00`),
  );
}

export function SermonCard({ video }: { video: YouTubeVideo }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md p-2">
      <Link
        href={video.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        aria-label={`Watch ${video.title} on YouTube`}
      >
        <div className="relative aspect-video overflow-hidden bg-muted rounded-lg">
          <Image
            src={video.featuredImg}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
          <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-md bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
            <IconPlayerPlay className="size-3 fill-current" />
            {video.timeLength}
          </span>
          <span className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md bg-background/40 px-3.5 py-2 text-xs font-medium text-foreground backdrop-blur-sm">
            <IconPlayerPlay className="size-3 fill-current" />
            Click to watch
          </span>
        </div>
        <div className="space-y-3 pt-5 pb-1 px-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {formatDate(video.datePosted)}
          </p>
          <h3 className="line-clamp-2 min-h-12 font-heading text-xl font-semibold leading-tight transition-colors duration-300 group-hover:text-primary">
            {video.title}
          </h3>
        </div>
      </Link>
    </article>
  );
}

function TopSermonHero({ video }: { video: YouTubeVideo }) {
  return (
    <Link
      href={video.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative mb-10 block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md"
      aria-label={`Watch ${video.title} on YouTube`}
    >
      <div className="relative aspect-video w-full md:aspect-21/8">
        <Image
          src={video.featuredImg}
          alt=""
          fill
          priority
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-background/95 via-background/30 to-transparent" />

        {/* Play button — top-right on mobile, centred on desktop */}
        <div className="absolute right-3 top-3 md:inset-0 md:flex md:items-center md:justify-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-background/60 text-foreground shadow-md backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-background md:size-14">
            <IconPlayerPlay className="size-5 translate-x-0.5 fill-current md:size-6" />
          </span>
        </div>

        {/* Info */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
          <div className="max-w-2xl">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-md bg-primary/30 border border-primary/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-foreground">
                Latest
              </span>
              <span className="rounded-md bg-background/90 px-2.5 py-0.5 text-[10px] font-medium text-foreground backdrop-blur-sm">
                {video.timeLength}
              </span>
              <span className="text-xs font-medium text-white/70">
                {formatDate(video.datePosted)}
              </span>
            </div>
            <h2 className="font-heading text-xl font-bold leading-snug text-white drop-shadow-sm md:text-3xl">
              {video.title}
            </h2>
          </div>
        </div>
      </div>
    </Link>
  );
}

function EmptySermons({ hasFilters = false }: { hasFilters?: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
      <h2 className="font-heading text-2xl font-semibold">
        {hasFilters
          ? "No sermons match those filters"
          : "Sermons are coming soon"}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground">
        {hasFilters
          ? "Try a different search or year."
          : "New messages will appear here as soon as the YouTube library is updated."}
      </p>
    </div>
  );
}

export function SermonLibrary({ videos }: SermonLibraryProps) {
  const sortedVideos = useMemo(
    () => sortByDate(videos.filter((v) => isLongFormDuration(v.timeLength))),
    [videos],
  );

  const [query, setQuery] = useState("");
  const [year, setYear] = useState("all");

  const years = useMemo(
    () =>
      [...new Set(sortedVideos.map((v) => v.datePosted.slice(0, 4)))]
        .sort()
        .reverse(),
    [sortedVideos],
  );

  const isFiltering = Boolean(query.trim() || year !== "all");

  const filteredVideos = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortedVideos.filter((v) => {
      const matchesQuery = v.title.toLowerCase().includes(q);
      const matchesYear = year === "all" || v.datePosted.startsWith(year);
      return matchesQuery && matchesYear;
    });
  }, [query, sortedVideos, year]);

  const featuredVideo = !isFiltering ? sortedVideos[0] : null;
  const gridVideos = !isFiltering ? filteredVideos.slice(1) : filteredVideos;

  return (
    <>
      {/* Featured hero (hidden while filtering) */}
      {featuredVideo && <TopSermonHero video={featuredVideo} />}

      {/* Search + year filter */}
      <div className="mb-8 flex gap-3 rounded-xl border border-border bg-card/60 p-2 shadow-sm">
        <label className="relative flex min-w-0 flex-1 items-center">
          <IconSearch className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
          <span className="sr-only">Search sermons</span>
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sermons..."
            className="h-11 rounded-md border border-border bg-background pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <label className="flex items-center gap-3 w-20 md:w-48">
          <span className="sr-only">Filter sermons by year</span>
          <Select
            value={year}
            onValueChange={(value) => setYear(value ?? "all")}
          >
            <SelectTrigger className="h-11 w-full rounded-md border-border bg-background">
              <SelectValue placeholder="All years" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All years</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </label>
      </div>

      {/* Grid */}
      {gridVideos.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gridVideos.map((video) => (
            <SermonCard key={video.link} video={video} />
          ))}
        </div>
      ) : (
        <EmptySermons hasFilters={isFiltering} />
      )}
    </>
  );
}
