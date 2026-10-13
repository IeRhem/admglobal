"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@repo/ui/components/badge"
import { Button } from "@repo/ui/components/button"
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar"
import {
  IconCalendarEvent,
  IconClock,
  IconMapPin,
  IconPhoto,
  IconTicket,
  IconUsers,
  IconChevronRight,
} from "@tabler/icons-react"
import {
  cn,
  formatEventDateRange,
  formatEventTime,
  getEventImageUrl,
} from "@/lib/utils"
import { EventAttendeesDialog } from "@/components/events/event-attendees-dialog"
import type { AdminEventItem } from "@/components/events/types"

interface UpcomingEventsCardsProps {
  events: AdminEventItem[]
}

export function UpcomingEventsCards({ events }: UpcomingEventsCardsProps) {
  const [selectedEvent, setSelectedEvent] = React.useState<AdminEventItem | null>(null)
  const [isAttendeesOpen, setIsAttendeesOpen] = React.useState(false)

  const now = new Date()
  const upcomingEvents = events
    .filter((e) => new Date(e.endDate) >= now)
    .slice(0, 4)

  if (upcomingEvents.length === 0) {
    return null
  }

  return (
    <>
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconCalendarEvent className="size-4" />
            </span>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Upcoming Programs & Registration Headcount
            </h2>
          </div>

          <Link
            href="/events"
            className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
          >
            All Events ({events.length})
            <IconChevronRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {upcomingEvents.map((ev) => {
            const dateStr = formatEventDateRange(ev.startDate, ev.endDate)
            const timeStr = formatEventTime(ev.time)
            const attendeeCount = ev.reservations?.length || 0
            const flyerUrl = ev.flyers?.[0]?.image
              ? getEventImageUrl(ev.flyers[0].image)
              : null

            return (
              <div
                key={ev.id}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border bg-card shadow-xs transition hover:border-primary/40 hover:shadow-sm"
              >
                {/* Flyer Preview or Gradient Header */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted/40">
                  {flyerUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={flyerUrl}
                      alt={ev.theme}
                      className="size-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
                      <IconCalendarEvent className="size-10 opacity-40" />
                    </div>
                  )}

                  <div className="absolute top-2.5 right-2.5">
                    <Badge
                      variant="secondary"
                      className="bg-black/60 text-white backdrop-blur-xs text-[10px] uppercase font-semibold"
                    >
                      Upcoming
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between p-4 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-semibold text-sm text-foreground line-clamp-1" title={ev.theme}>
                      {ev.theme}
                    </h3>
                    <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                        <IconClock className="size-3.5 text-primary shrink-0" />
                        {dateStr} {timeStr ? `• ${timeStr}` : ""}
                      </span>
                      {ev.location && (
                        <span className="flex items-center gap-1.5 truncate">
                          <IconMapPin className="size-3.5 shrink-0" />
                          <span className="truncate">{ev.location}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Registered Attendees button / badge */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-border/50">
                    <div className="flex items-center gap-1.5">
                      <IconTicket className="size-3.5 text-blue-500" />
                      <span className="text-xs font-semibold text-foreground">
                        {attendeeCount}{" "}
                        <span className="font-normal text-muted-foreground text-[11px]">
                          registered
                        </span>
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedEvent(ev)
                        setIsAttendeesOpen(true)
                      }}
                      className="h-7 px-2.5 text-xs font-medium"
                    >
                      View Attendees
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <EventAttendeesDialog
        event={selectedEvent}
        open={isAttendeesOpen}
        onOpenChange={setIsAttendeesOpen}
      />
    </>
  )
}
