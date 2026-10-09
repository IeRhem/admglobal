import { upcomingEvents } from "@/data/events";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  IconArrowLeft,
  IconCalendar,
  IconClock,
  IconMapPin,
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

export async function generateStaticParams() {
  return upcomingEvents.map((e) => ({ slug: e.id }));
}

export async function generateMetadata(
  props: PageProps<"/events/[slug]">,
) {
  const { slug } = await props.params;
  const event = upcomingEvents.find((e) => e.id === slug);
  if (!event) return { title: "Event Not Found" };
  return {
    title: `${event.title} | ADMI Events`,
    description: event.description,
  };
}

export default async function EventDetailPage(
  props: PageProps<"/events/[slug]">,
) {
  const { slug } = await props.params;
  const event = upcomingEvents.find((e) => e.id === slug);

  if (!event) notFound();

  return (
    <section className="min-h-screen w-full pb-16">
      {/* Hero banner */}
      <div className="relative w-full max-w-7xl mx-auto mt-15 rounded-2xl aspect-16/7 md:aspect-21/7 overflow-hidden">
        <Image
          src={event.image}
          alt={event.title}
          fill
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
            <div className="flex items-center gap-3 mb-3 text-sm text-white/80">
              <span className="bg-primary/90 text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-md">
                {event.time}
              </span>
              <span>{formatDateRange(event.date, event.endDate)}</span>
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
            <a
              href="#register"
              className={buttonVariants({ size: "lg" })}
            >
              Register Now
            </a>
          </div>
        </div>

        {/* Right column — registration form */}
        <div id="register" className="w-full md:w-96 md:sticky md:top-24 md:self-start shrink-0 scroll-mt-24">
          <EventRegistrationForm
            eventId={event.id}
            eventTitle={event.title}
          />
        </div>
      </div>
    </section>
  );
}
