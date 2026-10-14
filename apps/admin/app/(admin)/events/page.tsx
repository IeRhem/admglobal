import { Suspense } from "react"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getPresignedUrl } from "@/lib/r2"
import {
  db,
  desc,
  inArray,
  event,
  flyer,
  minister,
  event_minister,
  reservation,
} from "@repo/database"
import { EventStats } from "@/components/events/event-stats"
import { EventsTable } from "@/components/events/events-table"
import type { AdminEventItem } from "@/components/events/types"

export const metadata: Metadata = {
  title: "Events | ADM Global Admin",
  description: "Schedule, coordinate, and manage church programs, conferences, and guest seat reservations.",
}

async function getEvents(): Promise<AdminEventItem[]> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    if (!session || !session.user || (session.user as { role?: string }).role !== "admin") {
      throw new Error("Forbidden: Admin access required.")
    }

    const rows = await db
      .select()
      .from(event)
      .orderBy(desc(event.startDate))

    const eventIds = rows.map((r) => r.id)

    if (eventIds.length === 0) {
      return []
    }

    // Fetch flyers, reservations, and minister links in parallel
    const [flyers, reservations, ministerLinks] = await Promise.all([
      db.select().from(flyer).where(inArray(flyer.eventId, eventIds)),
      db
        .select()
        .from(reservation)
        .where(inArray(reservation.eventId, eventIds)),
      db
        .select()
        .from(event_minister)
        .where(inArray(event_minister.eventId, eventIds)),
    ])

    // Fetch ministers if links exist
    const ministerIds = Array.from(
      new Set(ministerLinks.map((ml) => ml.ministerId))
    )
    const ministers =
      ministerIds.length > 0
        ? await db
            .select()
            .from(minister)
            .where(inArray(minister.id, ministerIds))
        : []

    const ministerMap = new Map<string, (typeof ministers)[0]>()
    for (const m of ministers) {
      ministerMap.set(m.id, m)
    }

    const flyersByEvent = new Map<string, AdminEventItem["flyers"]>()
    for (const fl of flyers) {
      let resolvedImage = fl.image
      if (
        fl.image &&
        !fl.image.startsWith("http://") &&
        !fl.image.startsWith("https://") &&
        !fl.image.startsWith("/")
      ) {
        try {
          resolvedImage = await getPresignedUrl(fl.image)
        } catch {
          resolvedImage = `/api/s3/download?key=${encodeURIComponent(fl.image)}`
        }
      }

      const list = flyersByEvent.get(fl.eventId) ?? []
      list.push({ ...fl, image: resolvedImage })
      flyersByEvent.set(fl.eventId, list)
    }

    // Group reservations by event
    const reservationsByEvent = new Map<string, typeof reservations>()
    for (const r of reservations) {
      const list = reservationsByEvent.get(r.eventId) ?? []
      list.push(r)
      reservationsByEvent.set(r.eventId, list)
    }

    // Group ministers by event
    const ministersByEvent = new Map<string, typeof ministers>()
    for (const link of ministerLinks) {
      const m = ministerMap.get(link.ministerId)
      if (m) {
        const list = ministersByEvent.get(link.eventId) ?? []
        list.push(m)
        ministersByEvent.set(link.eventId, list)
      }
    }

    return rows.map((ev) => ({
      ...ev,
      flyers: (flyersByEvent.get(ev.id) ?? []) as AdminEventItem["flyers"],
      reservations: (reservationsByEvent.get(ev.id) ?? []) as AdminEventItem["reservations"],
      ministers: (ministersByEvent.get(ev.id) ?? []) as AdminEventItem["ministers"],
    }))
  } catch (error) {
    console.error("Failed to fetch events from database:", error)
    throw error
  }
}

async function EventsContent() {
  const events = await getEvents()

  return (
    <>
      {/* Metric Section Cards */}
      <EventStats events={events} />

      {/* Interactive TanStack Data Table */}
      <EventsTable initialData={events} />
    </>
  )
}

function EventsSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:gap-6 animate-pulse" aria-busy="true">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl border bg-muted/40 p-4" />
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex h-10 w-full items-center justify-between gap-4">
          <div className="h-9 w-64 rounded-md bg-muted/60" />
          <div className="h-9 w-32 rounded-md bg-muted/60" />
        </div>
        <div className="h-96 w-full rounded-lg border bg-muted/30" />
      </div>
    </div>
  )
}

export default function EventsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Page Title & Subtitle */}
          <div className="flex flex-col gap-1 px-4 lg:px-6">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Events
            </h1>
            <p className="text-sm text-muted-foreground">
              Schedule church programs, manage event artwork, coordinate
              ministers, and monitor attendee reservations.
            </p>
          </div>

          <Suspense fallback={<EventsSkeleton />}>
            <EventsContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
