import { Suspense } from "react";
import { getUpcomingEvents, type UpcomingEvent } from "@/data/events";
import Link from "next/link";
import Image from "next/image";
import { IconArrowRight, IconCalendar, IconRepeat } from "@tabler/icons-react";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = {
  title: "Events",
  description:
    "Join us for our upcoming events, conferences, and special services.",
};

function formatDateRange(start: string, end?: string) {
  const startDate = new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(
    new Date(`${start}T00:00:00`),
  );
  if (!end || start === end) return startDate;
  const endDate = new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(
    new Date(`${end}T00:00:00`),
  );
  return `${startDate} – ${endDate}`;
}

function EventCard({ event }: { event: UpcomingEvent }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md p-2 flex flex-col">
      <Link
        href={`/events/${event.id}`}
        className="flex-1 flex flex-col"
        aria-label={`View details for ${event.title}`}
      >
        <div className="relative aspect-16/10 overflow-hidden bg-muted rounded-lg shrink-0">
          <Image
            src={event.image}
            alt={event.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
          <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-md bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
            <IconCalendar className="size-3 fill-current opacity-80" />
            {event.time}
          </span>
          <span className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md bg-background/40 px-3.5 py-2 text-xs font-medium text-foreground backdrop-blur-sm">
            <IconArrowRight className="size-3" />
            View Event
          </span>
        </div>
        <div className="flex flex-col flex-1 space-y-2 pt-4 pb-2 px-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {formatDateRange(event.date, event.endDate)}
            </span>
            {event.isRecurring && event.recurringDays && event.recurringDays.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                <IconRepeat className="size-2.5" />
                Every {event.recurringDays.join(", ")}
              </span>
            )}
            {event.hasMorningSession && event.hasEveningSession && (
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[9px] font-semibold text-blue-600 dark:text-blue-400">
                Morning & Evening
              </span>
            )}
          </div>
          <h3 className="line-clamp-2 font-heading text-xl font-semibold leading-tight transition-colors duration-300 group-hover:text-primary">
            {event.title}
          </h3>
          <p className="line-clamp-3 text-sm text-muted-foreground flex-1">
            {event.description}
          </p>
        </div>
      </Link>
    </article>
  );
}

async function EventsList() {
  const events = (await getUpcomingEvents()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  return events.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No upcoming events right now"
            description="Please check back later for updates on our next gatherings."
            actionLabel="Share a Testimony"
            actionHref="/testify"
          />
        );
}

export default function EventsPage() {
  return (
    <section className="w-full px-4 pb-24 pt-32 md:px-10 min-h-screen">
      <div className="mx-auto max-w-6xl">
        {/* Page header */}
        <div className="mb-12">
            <p className="mb-3 text-lg font-heading tracking-widest text-primary">
              Upcoming Events
            </p>
            <h1 className="font-heading text-5xl font-bold leading-none md:text-7xl">
              Join our gatherings.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
              Be a part of what God is doing in this season. Find out more about our upcoming conferences, special services, and community events.
            </p>
        </div>

        <Suspense fallback={<div className="animate-pulse h-96 bg-muted rounded-2xl w-full"></div>}>
          <EventsList />
        </Suspense>
      </div>
    </section>
  );
}
