"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";

const events = [
  { name: "Sunday Service", time: "Every Sunday at 8 AM" },
  { name: "Healing School", time: "Every Tuesday at 10 AM" },
  { name: "Communion Service", time: "Every Wednesday 5 PM" },
];

const eventCardClassName =
  "text-center bg-primary/30 p-4 rounded-lg border-2 border-primary shrink-0 w-full";

const SWIPE_THRESHOLD = 40;

export function RegularEvents() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Animate the track to show the active slide
  const animateTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const slides = track.querySelectorAll<HTMLElement>(".event-slide");
    if (!slides[index]) return;
    gsap.to(track, {
      x: -slides[index].offsetLeft,
      duration: 0.45,
      ease: "power2.out",
    });
  }, []);

  // Re-animate whenever activeIndex changes
  useEffect(() => {
    animateTo(activeIndex);
  }, [activeIndex, animateTo]);

  // Autoplay
  useEffect(() => {
    if (isPaused) return;
    const interval = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % events.length);
    }, 4000);
    return () => window.clearInterval(interval);
  }, [isPaused]);

  const goNext = () => setActiveIndex((i) => (i + 1) % events.length);
  const goPrev = () =>
    setActiveIndex((i) => (i - 1 + events.length) % events.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      delta > 0 ? goNext() : goPrev();
    }
    touchStartX.current = null;
    setIsPaused(false);
  };

  return (
    <>
      {/* Desktop: static grid */}
      <div className="hidden w-full gap-6 md:grid md:grid-cols-3">
        {events.map((event) => (
          <div key={event.name} className={eventCardClassName}>
            <h2 className="text-xl font-bold">{event.name}</h2>
            <p className="text-foreground/80">{event.time}</p>
          </div>
        ))}
      </div>

      {/* Mobile: GSAP-animated horizontal track */}
      <div
        className="w-full select-none overflow-hidden md:hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setIsPaused(false);
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div ref={trackRef} className="flex will-change-transform">
          {events.map((event) => (
            <div key={event.name} className={`event-slide ${eventCardClassName}`}>
              <h2 className="text-xl font-bold">{event.name}</h2>
              <p className="text-muted-foreground">{event.time}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators (mobile only) */}
      <div
        className="mt-3 flex items-center justify-center gap-1.5 md:hidden"
        aria-label="Event slides"
      >
        {events.map((event, index) => (
          <button
            key={event.name}
            type="button"
            aria-label={`Show ${event.name}`}
            aria-current={index === activeIndex}
            onClick={() => setActiveIndex(index)}
            className={`size-2 rounded-full transition-all ${
              index === activeIndex ? "w-5 bg-primary" : "bg-primary/30"
            }`}
          />
        ))}
      </div>
    </>
  );
}

