import { Suspense } from "react";
import { getEventById } from "@/data/events";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  IconArrowLeft,
  IconCalendar,
  IconClock,
  IconMapPin,
  IconMoon,
  IconRepeat,
  IconSun,
  IconVideo,
} from "@tabler/icons-react";
import { buttonVariants } from "@repo/ui/components/button";
import { EventRegistrationForm } from "@/components/forms/event-registration-form";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(
    new Date(`${iso}T00:00:00`),
  );
}

function formatDateRange(start: string, end?: string) {
  if (!end || start === end) return formatDate(start);
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export async function generateMetadata(props: PageProps<"/events/[slug]">) {
  const { slug } = await props.params;
  const event = await getEventById(slug);
  if (!event) return { title: "Event Not Found" };
  return {
    title: `${event.title} | ADMI Events`,
    description: event.description,
  };
}

export const instant = false;

async function EventDetailContent({ slug }: { slug: string }) {
  const event = await getEventById(slug);

  if (!event) notFound();

  return (
    <section className="min-h-screen w-full pb-16">
      {/* Hero banner */}
      <div className="relative w-full max-w-7xl mx-auto mt-15 rounded-2xl aspect-16/7 md:aspect-21/7 overflow-hidden">
        <Image
          src={event.image}
          alt={event.title}
          fill
          unoptimized
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

        {/* Back button */}
        <div className="absolute top-6 left-4 md:left-10 z-10">
          <Link
            href="/#events"
            className={buttonVariants({
              variant: "secondary",
              size: "sm",
            })}
          >
            <IconArrowLeft className="size-4" />
            Back to Events
          </Link>
        </div>

        {/* Title over hero */}
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2.5 mb-3 text-sm text-white/90">
              <span className="bg-primary/90 text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-md">
                {event.time}
              </span>
              <span>{formatDateRange(event.date, event.endDate)}</span>

              {event.isRecurring &&
                event.recurringDays &&
                event.recurringDays.length > 0 && (
                  <span className="inline-flex items-center gap-1 bg-amber-500/90 text-neutral-950 text-xs font-bold px-2.5 py-1 rounded-md">
                    <IconRepeat className="size-3.5" />
                    Every {event.recurringDays.join(", ")}
                  </span>
                )}

              {event.hasMorningSession && event.hasEveningSession && (
                <span className="inline-flex items-center gap-1 bg-blue-500/80 text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                  <IconSun className="size-3.5" />
                  Morning & Evening Sessions
                </span>
              )}

              {event.hasMorningSession && !event.hasEveningSession && (
                <span className="inline-flex items-center gap-1 bg-amber-500/90 text-neutral-950 text-xs font-semibold px-2.5 py-1 rounded-md">
                  <IconSun className="size-3.5" />
                  Morning Session
                  {event.morningTime ? `: ${event.morningTime}` : ""}
                </span>
              )}

              {!event.hasMorningSession && event.hasEveningSession && (
                <span className="inline-flex items-center gap-1 bg-indigo-500/80 text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                  <IconMoon className="size-3.5" />
                  Evening Session
                  {event.eveningTime ? `: ${event.eveningTime}` : ""}
                </span>
              )}

              <span className="inline-flex items-center gap-1 bg-emerald-500/80 text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                <IconVideo className="size-3.5" />
                In-Person & Online Live
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-white leading-tight uppercase tracking-wide">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-10 mt-10 flex flex-col md:flex-row gap-10">
        {/* Left column — details */}
        <div className="flex-1">
          {/* Event info badges */}
          <div className="flex flex-col gap-3 mb-8 pb-8 border-b border-border">
            {/* Recurring Schedule */}
            {event.isRecurring &&
              event.recurringDays &&
              event.recurringDays.length > 0 && (
                <div className="flex items-center gap-3 text-foreground p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <IconRepeat className="size-5 text-amber-500 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Recurring Service / Gathering
                    </span>
                    <span className="text-sm font-medium">
                      Meets every {event.recurringDays.join(", ")}
                    </span>
                  </div>
                </div>
              )}

            <div className="flex items-center gap-3 text-foreground">
              <IconCalendar className="size-5 text-primary shrink-0" />
              <span className="text-base">
                {formatDateRange(event.date, event.endDate)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-foreground">
              <IconClock className="size-5 text-primary shrink-0" />
              <span className="text-base">{event.time}</span>
            </div>
            <div className="flex items-center gap-3 text-foreground">
              <IconMapPin className="size-5 text-primary shrink-0" />
              <span className="text-base">{event.location}</span>
            </div>

            <div className="flex items-center gap-3 text-foreground">
              <IconVideo className="size-5 text-primary shrink-0" />
              <div className="flex flex-col">
                <span className="text-base">In-Person & Online Attendance</span>
                <span className="text-xs text-muted-foreground">
                  Attend in person at the sanctuary or participate interactively
                  via live broadcast
                </span>
              </div>
            </div>

            {/* Daily Sessions breakdown if available */}
            {(event.hasMorningSession || event.hasEveningSession) && (
              <div className="mt-2 pt-3 border-t border-border/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                  Sessions & Timings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {event.hasMorningSession && (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                        <IconSun className="size-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground">
                          Morning Session
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {event.morningTime || "Morning Schedule"}
                        </span>
                      </div>
                    </div>
                  )}

                  {event.hasEveningSession && (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                        <IconMoon className="size-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground">
                          Evening Session
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {event.eveningTime || "Evening Schedule"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* About */}
          <div>
            <h2 className="text-2xl font-heading font-bold mb-4">
              About this Event
            </h2>
            <div className="text-lg leading-relaxed text-foreground/85 whitespace-pre-wrap">
              {event.fullDescription}
            </div>
          </div>

          {/* Share / CTA (mobile) */}
          <div className="mt-8 flex gap-3 md:hidden">
            <a href="#register" className={buttonVariants({ size: "lg" })}>
              Register Now
            </a>
          </div>
        </div>

        {/* Right column — registration form */}
        <div
          id="register"
          className="w-full md:w-96 md:sticky md:top-24 md:self-start shrink-0 scroll-mt-24"
        >
          <EventRegistrationForm
            eventId={event.id}
            eventTitle={event.title}
            eventImage={event.image}
            badgeImage={event.badgeImage}
            eventDate={formatDateRange(event.date, event.endDate)}
            eventLocation={event.location}
            isRecurring={event.isRecurring}
            recurringDays={event.recurringDays}
            hasMorningSession={event.hasMorningSession}
            morningTime={event.morningTime}
            hasEveningSession={event.hasEveningSession}
            eveningTime={event.eveningTime}
          />
        </div>
      </div>
    </section>
  );
}

export default async function EventDetailPage(
  props: PageProps<"/events/[slug]">,
) {
  const { slug } = await props.params;

  return (
    <Suspense
      fallback={<div className="animate-pulse min-h-screen w-full bg-muted" />}
    >
      <EventDetailContent slug={slug} />
    </Suspense>
  );
}
