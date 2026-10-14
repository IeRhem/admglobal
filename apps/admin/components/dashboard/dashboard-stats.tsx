"use client"

import * as React from "react"
import { Badge } from "@repo/ui/components/badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card"
import {
  IconCalendarEvent,
  IconTicket,
  IconUsers,
  IconVideo,
  IconMapPin,
  IconTrendingUp,
} from "@tabler/icons-react"

interface DashboardStatsProps {
  totalEvents: number
  upcomingEventsCount: number
  totalAttendees: number
  inPersonAttendees: number
  onlineAttendees: number
}

export function DashboardStats({
  totalEvents,
  upcomingEventsCount,
  totalAttendees,
  inPersonAttendees,
  onlineAttendees,
}: DashboardStatsProps) {
  const inPersonPercentage = totalAttendees > 0
    ? Math.round((inPersonAttendees / totalAttendees) * 100)
    : 0

  const onlinePercentage = totalAttendees > 0
    ? Math.round((onlineAttendees / totalAttendees) * 100)
    : 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Events */}
      <Card className="relative overflow-hidden border shadow-xs transition hover:shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardDescription className="text-xs font-medium uppercase tracking-wider">
            Total Events
          </CardDescription>
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconCalendarEvent className="size-4" />
          </div>
        </CardHeader>
        <div className="px-6 pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {totalEvents}
          </CardTitle>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]">
              {upcomingEventsCount} Upcoming
            </Badge>
            <span>programs scheduled</span>
          </div>
        </div>
      </Card>

      {/* Total Registered Attendees */}
      <Card className="relative overflow-hidden border shadow-xs transition hover:shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardDescription className="text-xs font-medium uppercase tracking-wider">
            Total Registrations
          </CardDescription>
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <IconTicket className="size-4" />
          </div>
        </CardHeader>
        <div className="px-6 pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {totalAttendees}
          </CardTitle>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
            <IconTrendingUp className="size-3.5 text-emerald-500" />
            <span>Across all church programs</span>
          </div>
        </div>
      </Card>

      {/* In-Person Attendees */}
      <Card className="relative overflow-hidden border shadow-xs transition hover:shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardDescription className="text-xs font-medium uppercase tracking-wider">
            In-Person Turnout
          </CardDescription>
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <IconMapPin className="size-4" />
          </div>
        </CardHeader>
        <div className="px-6 pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {inPersonAttendees}
          </CardTitle>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]">
              {inPersonPercentage}% of total
            </Badge>
            <span>Physical seat bookings</span>
          </div>
        </div>
      </Card>

      {/* Online Attendees */}
      <Card className="relative overflow-hidden border shadow-xs transition hover:shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardDescription className="text-xs font-medium uppercase tracking-wider">
            Online Attendance
          </CardDescription>
          <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
            <IconVideo className="size-4" />
          </div>
        </CardHeader>
        <div className="px-6 pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {onlineAttendees}
          </CardTitle>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px]">
              {onlinePercentage}% of total
            </Badge>
            <span>Virtual participants</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
