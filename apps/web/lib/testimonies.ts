import "server-only";
import { z } from "zod";
import type { Testimony } from "@/lib/testimony-types";

const apiTestimonySchema = z.object({
  id: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  message: z.string(),
  createdAt: z.coerce.date(),
  images: z.array(z.object({ image: z.string() })),
});

const testimonyListSchema = z.object({
  testimonies: z.array(apiTestimonySchema),
  next_cursor: z.string().nullable(),
});

function getApiUrl(path: string) {
  const apiUrl = process.env.INTERNAL_API_URL || process.env.ADMI_API_URL;
  if (!apiUrl) {
    throw new Error("API URL is required to load testimonies");
  }
  return new URL(path, apiUrl);
}

async function fetchTestimony(path: string) {
  const response = await fetch(getApiUrl(path), { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(
      `Testimony API request failed (${response.status} ${response.statusText})`,
    );
  }
  return apiTestimonySchema.parse(await response.json());
}

function toTestimony(item: z.infer<typeof apiTestimonySchema>): Testimony {
  const authorName = [item.firstName, item.lastName]
    .filter(Boolean)
    .join(" ");
  const firstSentence = item.message.split(/(?<=[.!?])\s|[\r\n]/, 1)[0]!;

  return {
    id: item.id,
    category: "Testimony",
    title:
      firstSentence.length > 100
        ? `${firstSentence.slice(0, 97).trimEnd()}…`
        : firstSentence,
    excerpt:
      item.message.length > 220
        ? `${item.message.slice(0, 217).trimEnd()}…`
        : item.message,
    fullStory: item.message,
    date: item.createdAt.toISOString().slice(0, 10),
    images: item.images.map(({ image }) =>
      image.startsWith("testimonials/")
        ? getApiUrl(
            `/api/s3/download?key=${encodeURIComponent(image)}`,
          ).toString()
        : image,
    ),
    author: {
      name: authorName || "Church member",
      location: "",
    },
  };
}

export async function getTestimonies(): Promise<Testimony[]> {
  const testimonies: z.infer<typeof apiTestimonySchema>[] = [];
  let cursor: string | null = null;

  do {
    const url = getApiUrl("/api/testimonials");
    url.searchParams.set("limit", "100");
    if (cursor) url.searchParams.set("cursor", cursor);

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(
        `Testimony API request failed (${response.status} ${response.statusText})`,
      );
    }
    const page = testimonyListSchema.parse(await response.json());
    testimonies.push(...page.testimonies);
    cursor = page.next_cursor;
  } while (cursor);

  return testimonies.map(toTestimony);
}

export async function getTestimonyById(id: string): Promise<Testimony | null> {
  if (!id || typeof id !== "string") return null;
  const testimony = await fetchTestimony(`/api/testimonials/${id}`);
  return testimony ? toTestimony(testimony) : null;
}
