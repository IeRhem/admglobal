import "server-only";
import { connection } from "next/server";
import { z } from "zod";

export type UpcomingEvent = {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  date: string;
  endDate?: string;
  time: string;
  location: string;
  image: string;
};

const apiEventSchema = z.object({
  id: z.number().int(),
  theme: z.string(),
  description: z.string().nullable(),
  time: z.iso.time({ precision: 0 }),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  location: z.string().nullable(),
  flyers: z.array(
    z.object({
      image: z.string(),
      type: z.enum(["mobile", "desktop"]),
    }),
  ),
});

const eventListSchema = z.object({
  events: z.array(apiEventSchema),
  next_cursor: z.string().nullable(),
});

type ApiEvent = z.infer<typeof apiEventSchema>;
const EVENT_TIME_ZONE = "Africa/Lagos";

function getApiUrl(path: string) {
  const apiUrl = process.env.INTERNAL_API_URL || process.env.ADMI_API_URL;
  if (!apiUrl) {
    throw new Error("API URL is required to load events");
  }

  return new URL(path, apiUrl);
}

function toUpcomingEvent(event: ApiEvent): UpcomingEvent {
  const eventDate = (date: Date) => date.toISOString().slice(0, 10);
  const flyer =
    event.flyers.find((item) => item.type === "desktop") ??
    event.flyers[0];
  const time = new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(`1970-01-01T${event.time}Z`));
  const description = event.description ?? "";

  return {
    id: String(event.id),
    title: event.theme,
    description,
    fullDescription: description,
    date: eventDate(event.start_date),
    endDate: eventDate(event.end_date),
    time,
    location: event.location ?? "Location to be announced",
    image: flyer?.image ?? "/grid-image/image-1.jpg",
  };
}

export async function getUpcomingEvents(): Promise<UpcomingEvent[]> {
  const events: ApiEvent[] = [];
  let cursor: string | null = null;

  do {
    const url = getApiUrl("/api/events");
    url.searchParams.set("limit", "100");
    if (cursor) url.searchParams.set("cursor", cursor);

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(
        `Event API request failed (${response.status} ${response.statusText})`,
      );
    }

    const page = eventListSchema.parse(await response.json());
    events.push(...page.events);
    cursor = page.next_cursor;
  } while (cursor);

  await connection();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return events
    .map(toUpcomingEvent)
    .filter((event) => (event.endDate ?? event.date) >= today);
}

export async function getEventById(id: string): Promise<UpcomingEvent | null> {
  if (!/^\d+$/.test(id)) return null;

  const response = await fetch(getApiUrl(`/api/events/${id}`), {
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(
      `Event API request failed (${response.status} ${response.statusText})`,
    );
  }

  return toUpcomingEvent(apiEventSchema.parse(await response.json()));
}
