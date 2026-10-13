"use client"

import { Badge } from "@repo/ui/components/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card"
import {
  IconCalendarEvent,
  IconClock,
  IconPhoto,
  IconTicket,
} from "@tabler/icons-react"
import type { AdminEventItem } from "./types"

interface EventStatsProps {
  events: AdminEventItem[]
}

export function EventStats({ events }: EventStatsProps) {
  const now = new Date()

  const total = events.length

  const upcomingEvents = events.filter((e) => {
    const end = new Date(e.endDate)
    return end >= now
  })
  const upcomingCount = upcomingEvents.length

  const totalReservations = events.reduce(
    (acc, e) => acc + (e.reservations?.length || 0),
    0
  )

  const withFlyers = events.filter(
    (e) => e.flyers && e.flyers.length > 0
  ).length

  const flyerCoverage = total > 0 ? Math.round((withFlyers / total) * 100) : 0

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* Total Events */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Events</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {total}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconCalendarEvent className="size-3.5" />
              All Scheduled
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Church programs
          </div>
          <div className="text-muted-foreground">
            Conferences, vigils & services
          </div>
        </CardFooter>
      </Card>

      {/* Upcoming Events */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Upcoming Events</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {upcomingCount}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={
                upcomingCount > 0
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
              }
            >
              <IconClock className="size-3.5" />
              {upcomingCount > 0 ? "Active schedule" : "None scheduled"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-emerald-600 dark:text-emerald-400">
            Open for registration
          </div>
          <div className="text-muted-foreground">
            Visible on the public calendar
          </div>
        </CardFooter>
      </Card>

      {/* Total Reservations */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Seat Reservations</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalReservations}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
            >
              <IconTicket className="size-3.5" />
              Attendees
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Registered guests
          </div>
          <div className="text-muted-foreground">
            Members & online registrations
          </div>
        </CardFooter>
      </Card>

      {/* Flyer Coverage */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>With Flyers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {withFlyers}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconPhoto className="size-3.5" />
              {flyerCoverage}% coverage
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Graphic artwork
          </div>
          <div className="text-muted-foreground">
            Desktop & mobile banners attached
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
