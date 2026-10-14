import { Suspense } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import {
  db,
  desc,
  eq,
  inArray,
  event,
  flyer,
  minister,
  event_minister,
  reservation,
} from "@repo/database";
import { auth } from "@/lib/auth";
import { getPresignedUrl } from "@/lib/r2";
import { AdminWelcomeCard } from "@/components/dashboard/admin-welcome-card";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { UpcomingEventsCards } from "@/components/dashboard/upcoming-events-cards";
import {
  RecentRegistrationsTable,
  type DashboardAttendeeItem,
} from "@/components/dashboard/recent-registrations-table";
import type { AdminEventItem } from "@/components/events/types";

export const metadata: Metadata = {
  title: "Admin Dashboard | ADM Global",
  description:
    "Overview of church events, registered attendees, and admin controls.",
};

async function getDashboardData() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (
      !session ||
      !session.user ||
      (session.user as { role?: string }).role !== "admin"
    ) {
      throw new Error("Forbidden: Admin access required.");
    }

    // Fetch all events
    const eventRows = await db
      .select()
      .from(event)
      .orderBy(desc(event.startDate));

    const eventIds = eventRows.map((e) => e.id);

    // Fetch flyers, reservations, and minister links in parallel
    const [flyers, reservations, ministerLinks, allJoinedReservations] =
      await Promise.all([
        eventIds.length > 0
          ? db.select().from(flyer).where(inArray(flyer.eventId, eventIds))
          : [],
        eventIds.length > 0
          ? db
              .select()
              .from(reservation)
              .where(inArray(reservation.eventId, eventIds))
          : [],
        eventIds.length > 0
          ? db
              .select()
              .from(event_minister)
              .where(inArray(event_minister.eventId, eventIds))
          : [],
        db
          .select({
            id: reservation.id,
            eventId: reservation.eventId,
            firstName: reservation.firstName,
            lastName: reservation.lastName,
            email: reservation.email,
            phone: reservation.phone,
            attendanceMode: reservation.attendanceMode,
            session: reservation.session,
            preferredDay: reservation.preferredDay,
            badgePhoto: reservation.badgePhoto,
            createdAt: reservation.createdAt,
            eventTheme: event.theme,
            eventStartDate: event.startDate,
            eventLocation: event.location,
          })
          .from(reservation)
          .leftJoin(event, eq(reservation.eventId, event.id))
          .orderBy(desc(reservation.createdAt)),
      ]);

    // Fetch ministers
    const ministerIds = Array.from(
      new Set(ministerLinks.map((ml) => ml.ministerId)),
    );
    const ministers =
      ministerIds.length > 0
        ? await db
            .select()
            .from(minister)
            .where(inArray(minister.id, ministerIds))
        : [];

    const ministerMap = new Map<string, (typeof ministers)[0]>();
    for (const m of ministers) {
      ministerMap.set(m.id, m);
    }

    // Resolve flyer presigned URLs if needed
    const flyersByEvent = new Map<string, typeof flyers>();
    for (const fl of flyers) {
      let resolvedImage = fl.image;
      if (
        fl.image &&
        !fl.image.startsWith("http://") &&
        !fl.image.startsWith("https://") &&
        !fl.image.startsWith("/")
      ) {
        try {
          resolvedImage = await getPresignedUrl(fl.image);
        } catch {
          resolvedImage = `/api/s3/download?key=${encodeURIComponent(fl.image)}`;
        }
      }

      const list = flyersByEvent.get(fl.eventId) ?? [];
      list.push({ ...fl, image: resolvedImage });
      flyersByEvent.set(fl.eventId, list);
    }

    // Group reservations by event
    const reservationsByEvent = new Map<string, typeof reservations>();
    for (const r of reservations) {
      const list = reservationsByEvent.get(r.eventId) ?? [];
      list.push(r);
      reservationsByEvent.set(r.eventId, list);
    }

    // Group ministers by event
    const ministersByEvent = new Map<string, typeof ministers>();
    for (const link of ministerLinks) {
      const m = ministerMap.get(link.ministerId);
      if (m) {
        const list = ministersByEvent.get(link.eventId) ?? [];
        list.push(m);
        ministersByEvent.set(link.eventId, list);
      }
    }

    const eventsWithDetails: AdminEventItem[] = eventRows.map((ev) => ({
      ...ev,
      flyers: (flyersByEvent.get(ev.id) ?? []) as AdminEventItem["flyers"],
      reservations: (reservationsByEvent.get(ev.id) ??
        []) as AdminEventItem["reservations"],
      ministers: (ministersByEvent.get(ev.id) ??
        []) as AdminEventItem["ministers"],
    }));

    return {
      user: session?.user ?? null,
      events: eventsWithDetails,
      registrations: allJoinedReservations as DashboardAttendeeItem[],
    };
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
    throw error;
  }
}

async function DashboardContent() {
  const { user, events, registrations } = await getDashboardData();

  const now = new Date();
  const totalEvents = events.length;
  const upcomingEventsCount = events.filter(
    (e) => new Date(e.endDate) >= now,
  ).length;
  const totalAttendees = registrations.length;
  const inPersonAttendees = registrations.filter(
    (r) => (r.attendanceMode || "in-person").toLowerCase() === "in-person",
  ).length;
  const onlineAttendees = registrations.filter(
    (r) => (r.attendanceMode || "").toLowerCase() === "online",
  ).length;

  const eventTitles = events.map((e) => ({ id: e.id, theme: e.theme }));

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Admin Profile & Welcome Card */}
      <AdminWelcomeCard user={user} />

      {/* 2. Key Metrics Stats Grid */}
      <DashboardStats
        totalEvents={totalEvents}
        upcomingEventsCount={upcomingEventsCount}
        totalAttendees={totalAttendees}
        inPersonAttendees={inPersonAttendees}
        onlineAttendees={onlineAttendees}
      />

      {/* 3. Upcoming Events with Attendee Turnout */}
      <UpcomingEventsCards events={events} />

      {/* 4. Complete Registered Attendees Roster ("Who Registered") */}
      <RecentRegistrationsTable
        registrations={registrations}
        eventTitles={eventTitles}
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse" aria-busy="true">
      {/* Welcome Card Skeleton */}
      <div className="h-28 rounded-2xl border bg-muted/40" />

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl border bg-muted/40" />
        ))}
      </div>

      {/* Upcoming Events Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-64 rounded-xl border bg-muted/30" />
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="h-96 rounded-xl border bg-muted/20" />
    </div>
  );
}

export default function Page() {
  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 pt-0">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
