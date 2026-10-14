import { Suspense } from "react"
import type { Metadata } from "next"
import {
  db,
  desc,
  eq,
  event,
  reservation,
} from "@repo/database"
import {
  RecentRegistrationsTable,
  type DashboardAttendeeItem,
} from "@/components/dashboard/recent-registrations-table"
import { Badge } from "@repo/ui/components/badge"
import { IconTicket, IconUserCheck, IconVideo, IconMapPin } from "@tabler/icons-react"

export const metadata: Metadata = {
  title: "Registered Attendees | ADM Global Admin",
  description: "View and manage attendees who registered for church events, attendance mode, and contact details.",
}

async function getAttendeesData() {
  try {
    const [registrations, events] = await Promise.all([
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
      db
        .select({
          id: event.id,
          theme: event.theme,
        })
        .from(event)
        .orderBy(desc(event.startDate)),
    ])

    return {
      registrations: registrations as DashboardAttendeeItem[],
      eventTitles: events,
    }
  } catch (error) {
    console.error("Failed to load attendees data:", error)
    throw error
  }
}

async function AttendeesContent() {
  const { registrations, eventTitles } = await getAttendeesData()

  const totalAttendees = registrations.length
  const inPersonAttendees = registrations.filter(
    (r) => (r.attendanceMode || "in-person").toLowerCase() === "in-person"
  ).length
  const onlineAttendees = registrations.filter(
    (r) => (r.attendanceMode || "").toLowerCase() === "online"
  ).length

  return (
    <div className="flex flex-col gap-6">
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
                ({totalAttendees ? Math.round((inPersonAttendees / totalAttendees) * 100) : 0}%)
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
                ({totalAttendees ? Math.round((onlineAttendees / totalAttendees) * 100) : 0}%)
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
        eventTitles={eventTitles}
      />
    </div>
  )
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
  )
}

export default function AttendeesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex flex-col gap-1 px-4 lg:px-6">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <IconTicket className="size-4" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Event Attendees
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Track everyone who has registered for church conferences and programs, filter by in-person or online attendance, and access contact details.
            </p>
          </div>

          <div className="px-4 lg:px-6">
            <Suspense fallback={<AttendeesSkeleton />}>
              <AttendeesContent />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
