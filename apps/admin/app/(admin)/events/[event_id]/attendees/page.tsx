import { Suspense } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db, desc, eq, event, reservation } from "@repo/database";
import { notFound } from "next/navigation";
import {
  RecentRegistrationsTable,
  type DashboardAttendeeItem,
} from "@/components/dashboard/recent-registrations-table";
import {
  IconTicket,
  IconUserCheck,
  IconVideo,
  IconMapPin,
} from "@tabler/icons-react";

type AttendeesPageProps = {
  params: Promise<{ event_id: string }>;
};

async function getAttendeesData(eventId: string) {
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

    const [eventRow] = await db
      .select({
        id: event.id,
        theme: event.theme,
      })
      .from(event)
      .where(eq(event.id, eventId))
      .limit(1);

    if (!eventRow) {
      notFound();
    }

    const registrations = await db
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
      .where(eq(reservation.eventId, eventId))
      .orderBy(desc(reservation.createdAt));

    return {
      registrations: registrations as DashboardAttendeeItem[],
      event: eventRow,
    };
  } catch (error) {
    console.error("Failed to load attendees data:", error);
    throw error;
  }
}

async function AttendeesContent({ eventId }: { eventId: string }) {
  const { registrations, event } = await getAttendeesData(eventId);

  const totalAttendees = registrations.length;
  const inPersonAttendees = registrations.filter(
    (r) => (r.attendanceMode || "in-person").toLowerCase() === "in-person",
  ).length;
  const onlineAttendees = registrations.filter(
    (r) => (r.attendanceMode || "").toLowerCase() === "online",
  ).length;

  return (
    <>
      <div className="flex flex-col gap-1 px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconTicket className="size-4" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {event.theme} Attendees
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Review registrations for this event, filter by in-person or online
          attendance, and access contact details.
        </p>
      </div>

      <div className="flex flex-col gap-6 px-4 lg:px-6">
        {/* Overview Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Attendees */}
          <div className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-xs">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Total Registrations
              </span>
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {totalAttendees}
              </span>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconUserCheck className="size-5" />
            </div>
          </div>

          {/* In-Person */}
          <div className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-xs">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Attending In-Person
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {inPersonAttendees}
                </span>
                <span className="text-xs text-muted-foreground">
                  (
                  {totalAttendees
                    ? Math.round((inPersonAttendees / totalAttendees) * 100)
                    : 0}
                  %)
                </span>
              </div>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <IconMapPin className="size-5" />
            </div>
          </div>

          {/* Online */}
          <div className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-xs">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Joining Online
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                  {onlineAttendees}
                </span>
                <span className="text-xs text-muted-foreground">
                  (
                  {totalAttendees
                    ? Math.round((onlineAttendees / totalAttendees) * 100)
                    : 0}
                  %)
                </span>
              </div>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <IconVideo className="size-5" />
            </div>
          </div>
        </div>

        {/* Complete Registered Attendees Table with Search, Filter & CSV Export */}
        <RecentRegistrationsTable
          registrations={registrations}
          eventTitles={[event]}
        />
      </div>
    </>
  );
}

function AttendeesSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse" aria-busy="true">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl border bg-muted/40" />
        ))}
      </div>
      <div className="h-96 rounded-xl border bg-muted/20" />
    </div>
  );
}

async function AttendeesRouteContent({ params }: AttendeesPageProps) {
  const { event_id } = await params;
  return <AttendeesContent eventId={event_id} />;
}

export async function generateMetadata({
  params,
}: AttendeesPageProps): Promise<Metadata> {
  const { event_id } = await params;
  const [eventRow] = await db
    .select({ theme: event.theme })
    .from(event)
    .where(eq(event.id, event_id))
    .limit(1);

  return {
    title: eventRow
      ? `${eventRow.theme} Attendees | ADM Global Admin`
      : "Event Attendees | ADM Global Admin",
    description:
      "View and manage attendees registered for this event, including attendance mode and contact details.",
  };
}

export default function AttendeesPage({ params }: AttendeesPageProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <Suspense fallback={<AttendeesSkeleton />}>
            <AttendeesRouteContent params={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
