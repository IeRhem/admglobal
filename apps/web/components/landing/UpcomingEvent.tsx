"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { buttonVariants } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import type { UpcomingEvent } from "@/data/events";

function getUpcoming(events: UpcomingEvent[]) {
  return [...events].sort(
    (a, b) =>
      parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime(),
  );
}

function parseLocalDate(iso: string) {
  return new Date(`${iso}T00:00:00`);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(
    parseLocalDate(iso),
  );
}

/* ── Single event card ─────────────────────────────────────────────── */

function EventCard({ event }: { event: UpcomingEvent }) {
  return (
    <div className="upcoming-slide shrink-0 w-full px-1">
      <Link
        href={`/events/${event.id}`}
        className="group relative block w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden"
      >
        {/* Background image */}
        <Image
          src={event.image}
          alt={event.title}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="100vw"
          priority
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
          {/* Date badge + time */}
          <div className="flex items-center gap-3 mb-3 text-sm text-white/80">
            <span className="bg-primary/90 text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-md">
              {event.time}
            </span>
            <span>{formatDate(event.date)}</span>
          </div>

          {/* Title */}
          <h3 className="text-xl md:text-3xl font-heading font-bold text-white leading-snug uppercase tracking-wide">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-sm md:text-base text-white/70 leading-relaxed line-clamp-2 mt-2">
            {event.description}
          </p>

          {/* Actions — visible on hover (desktop) / always visible (mobile) */}
          <div className="flex gap-3 mt-4 md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300">
            <span
              className={cn(
                buttonVariants({ size: "sm" }),
                "pointer-events-auto",
              )}
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `/events/${event.id}#register`;
              }}
            >
              Register
            </span>
            <span
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "pointer-events-auto",
              )}
            >
              Read More
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ── Slideshow wrapper ─────────────────────────────────────────────── */

export function UpcomingEvents({
  events: allEvents,
}: {
  events: UpcomingEvent[];
}) {
  const events = getUpcoming(allEvents);
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = events.length;

  /* ── animation ── */
  const animateTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const slides = track.querySelectorAll<HTMLElement>(".upcoming-slide");
    if (!slides[index]) return;
    gsap.to(track, {
      x: -slides[index].offsetLeft,
      duration: 0.5,
      ease: "power2.out",
    });
  }, []);

  useEffect(() => {
    animateTo(current);
  }, [current, animateTo]);

  /* ── autoplay (only when multiple) ── */
  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    if (total <= 1) return;
    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, 6000);
  }, [total, stopAutoplay]);

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, [startAutoplay, stopAutoplay]);

  const resetAutoplay = useCallback(() => {
    stopAutoplay();
    startAutoplay();
  }, [stopAutoplay, startAutoplay]);

  /* ── navigation ── */
  const goNext = () => {
    setCurrent((prev) => (prev + 1) % total);
    resetAutoplay();
  };

  const goPrev = () => {
    setCurrent((prev) => (prev - 1 + total) % total);
    resetAutoplay();
  };

  /* ── touch / swipe ── */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) >= 40) {
      delta > 0 ? goNext() : goPrev();
    }
    touchStartX.current = null;
  };

  if (total === 0) return null;

  /* ── single event — no slideshow controls ── */
  if (total === 1) {
    return <EventCard event={events[0]} />;
  }

  /* ── multiple events — full slideshow ── */
  return (
    <div className="relative">
      <div
        className="overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div ref={trackRef} className="flex will-change-transform">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-6">
        {/* Prev — desktop only */}
        <button
          onClick={goPrev}
          className="hidden md:flex size-10 items-center justify-center rounded-full border border-border bg-card hover:bg-muted transition-colors cursor-pointer"
          aria-label="Previous event"
        >
          <IconChevronLeft className="size-5" />
        </button>

        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {events.map((event, i) => (
            <button
              key={event.id}
              onClick={() => {
                setCurrent(i);
                resetAutoplay();
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to event ${i + 1}`}
            />
          ))}
        </div>

        {/* Next — desktop only */}
        <button
          onClick={goNext}
          className="hidden md:flex size-10 items-center justify-center rounded-full border border-border bg-card hover:bg-muted transition-colors cursor-pointer"
          aria-label="Next event"
        >
          <IconChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
