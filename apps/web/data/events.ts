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
  badgeImage?: string | null;
  isRecurring?: boolean;
  recurringDays?: string[];
  hasMorningSession?: boolean;
  morningTime?: string | null;
  hasEveningSession?: boolean;
  eveningTime?: string | null;
  flyers?: Array<{
    image: string;
    type: "mobile" | "desktop";
  }>;
};

const apiEventSchema = z.object({
  id: z.string(),
  theme: z.string(),
  description: z.string().nullable(),
  time: z.iso.time({ precision: 0 }),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  location: z.string().nullable(),
  badgeImage: z.string().nullable().optional(),
  isRecurring: z.boolean().optional().default(false),
  recurringDays: z.array(z.string()).optional().default([]),
  hasMorningSession: z.boolean().optional().default(false),
  morningTime: z.string().nullable().optional(),
  hasEveningSession: z.boolean().optional().default(false),
  eveningTime: z.string().nullable().optional(),
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

export function getApiUrl(path: string) {
  const apiUrl = process.env.INTERNAL_API_URL || process.env.ADMI_API_URL;
  if (!apiUrl) {
    throw new Error("API URL is required to load events");
  }

  return new URL(path, apiUrl);
}

function getPublicApiUrl(path: string): string {
  const publicBase =
    process.env.ADMI_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.INTERNAL_API_URL;
  if (!publicBase) {
    throw new Error("API URL is required to resolve image URL");
  }

  return new URL(path, publicBase).toString();
}

export function resolveEventImageUrl(imagePath?: string | null): string {
  if (!imagePath) return "/grid-image/image-1.jpg";
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }
  if (
    imagePath.startsWith("/grid-image/") ||
    imagePath.startsWith("/favicon")
  ) {
    return imagePath;
  }
  if (imagePath.startsWith("/")) {
    return getPublicApiUrl(imagePath);
  }
  return getPublicApiUrl(
    `/api/s3/download?key=${encodeURIComponent(imagePath)}`,
  );
}

function toUpcomingEvent(event: ApiEvent): UpcomingEvent {
  const eventDate = (date: Date) => date.toISOString().slice(0, 10);
  const flyer =
    event.flyers.find((item) => item.type === "desktop") ?? event.flyers[0];
  const time = new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(`1970-01-01T${event.time}Z`));
  const description = event.description ?? "";

  const resolvedFlyers = event.flyers.map((f) => ({
    ...f,
    image: resolveEventImageUrl(f.image),
  }));

  const rawImage = flyer?.image || event.badgeImage || null;
  const image = resolveEventImageUrl(rawImage);
  const badgeImage = event.badgeImage
    ? resolveEventImageUrl(event.badgeImage)
    : null;

  return {
    id: event.id,
    title: event.theme,
    description,
    fullDescription: description,
    date: eventDate(event.startDate),
    endDate: eventDate(event.endDate),
    time,
    location: event.location ?? "Location to be announced",
    image,
    badgeImage,
    isRecurring: event.isRecurring,
    recurringDays: event.recurringDays,
    hasMorningSession: event.hasMorningSession,
    morningTime: event.morningTime,
    hasEveningSession: event.hasEveningSession,
    eveningTime: event.eveningTime,
    flyers: resolvedFlyers,
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

const UUID_REGEX =
  /^([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;

export async function getEventById(id: string): Promise<UpcomingEvent | null> {
  if (!id || typeof id !== "string" || !UUID_REGEX.test(id)) return null;

  const response = await fetch(
    getApiUrl(`/api/events/${encodeURIComponent(id)}`),
    {
      cache: "no-store",
    },
  );
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(
      `Event API request failed (${response.status} ${response.statusText})`,
    );
  }

  return toUpcomingEvent(apiEventSchema.parse(await response.json()));
}
