"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar"
import { Badge } from "@repo/ui/components/badge"
import { Button } from "@repo/ui/components/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/components/drawer"
import { Separator } from "@repo/ui/components/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/alert-dialog"
import {
  IconCalendarEvent,
  IconClock,
  IconCopy,
  IconDownload,
  IconEdit,
  IconExternalLink,
  IconMapPin,
  IconPhoto,
  IconTicket,
  IconTrash,
  IconUser,
  IconUsers,
  IconX,
  IconZoomIn,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { deleteEventAction } from "@/lib/action/event"
import {
  cn,
  formatEventDateRange,
  formatEventTime,
  getEventImageUrl,
} from "@/lib/utils"
import { EventAttendeesDialog } from "./event-attendees-dialog"
import type { AdminEventItem } from "./types"

interface EventDrawerProps {
  event: AdminEventItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (event: AdminEventItem) => void
  onUpdate?: () => void
}

function FlyerCard({
  src,
  type,
  onZoom,
}: {
  src: string
  type: string
  onZoom: (src: string) => void
}) {
  const [loaded, setLoaded] = React.useState(false)
  const [error, setError] = React.useState(false)

  return (
    <div
      className="group relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-xl border bg-muted/30 shadow-xs transition hover:border-primary/40"
      onClick={() => !error && onZoom(src)}
    >
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/40 animate-pulse text-xs text-muted-foreground">
          Loading {type} flyer...
        </div>
      )}

      {!error ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`${type} flyer`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setError(true)
            setLoaded(true)
          }}
          className={cn(
            "size-full object-cover transition duration-300 group-hover:scale-105",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-1.5 p-3 text-center text-xs text-muted-foreground bg-muted/30">
          <IconPhoto className="size-5 text-muted-foreground" />
          <span>Flyer image unavailable</span>
        </div>
      )}

      {/* Type Badge */}
      <div className="absolute top-2 left-2 z-10">
        <Badge
          variant="secondary"
          className="bg-black/60 text-white backdrop-blur-xs text-[10px] uppercase font-semibold tracking-wider"
        >
          {type}
        </Badge>
      </div>

      {/* Hover Zoom Overlay */}
      {!error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[1px] transition duration-200 group-hover:opacity-100">
          <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-md">
            <IconZoomIn className="size-3.5" />
            <span>Click to Enlarge</span>
          </div>
        </div>
      )}
    </div>
  )
}

export function EventDrawer({
  event,
  open,
  onOpenChange,
  onEdit,
  onUpdate,
}: EventDrawerProps) {
  const isMobile = useIsMobile()
  const [loading, setLoading] = React.useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [previewImage, setPreviewImage] = React.useState<string | null>(null)
  const [attendeesDialogOpen, setAttendeesDialogOpen] = React.useState(false)

  if (!event) return null

  const now = new Date()
  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)

  const isUpcoming = endDate >= now
  const isToday =
    now.getFullYear() === startDate.getFullYear() &&
    now.getMonth() === startDate.getMonth() &&
    now.getDate() === startDate.getDate()

  const formattedDates = formatEventDateRange(event.startDate, event.endDate)
  const formattedTime = formatEventTime(event.time)

  const handleDelete = async () => {
    try {
      setLoading(true)
      const res = await deleteEventAction(event.id)
      if (res.success) {
        toast.success("Event deleted successfully")
        setDeleteConfirmOpen(false)
        onUpdate?.()
        onOpenChange(false)
      } else {
        toast.error(res.error || "Failed to delete event")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLocation = () => {
    if (event.location) {
      navigator.clipboard.writeText(event.location)
      toast.success("Location copied to clipboard")
    }
  }

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        swipeDirection={isMobile ? "down" : "right"}
      >
        <DrawerContent className="sm:max-w-xl">
          <DrawerHeader className="gap-2 border-b pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <IconCalendarEvent className="size-6" />
                </div>
                <div>
                  <DrawerTitle className="text-xl font-semibold line-clamp-1">
                    {event.theme}
                  </DrawerTitle>
                  <DrawerDescription className="text-xs">
                    {formattedDates || "Date to be announced"}
                  </DrawerDescription>
                </div>
              </div>

              <div>
                {isToday ? (
                  <Badge
                    variant="outline"
                    className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
                  >
                    Happening Today
                  </Badge>
                ) : isUpcoming ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                  >
                    Upcoming
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Past Event
                  </Badge>
                )}
              </div>
            </div>
          </DrawerHeader>

          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-4 text-sm sm:px-6">
            {/* Schedule & Location Quick Bar */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-background text-primary shadow-xs">
                  <IconClock className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Time / Schedule
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {formattedTime || "Time TBA"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-xl border bg-muted/30 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-background text-primary shadow-xs">
                    <IconMapPin className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Venue
                    </span>
                    <span className="text-sm font-medium text-foreground line-clamp-1">
                      {event.location || "Location TBA"}
                    </span>
                  </div>
                </div>
                {event.location && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyLocation}
                    className="h-7 px-2 text-xs text-muted-foreground"
                  >
                    <IconCopy className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Event Overview
              </h3>
              <div className="rounded-xl border bg-card p-4 shadow-xs">
                <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                  {event.description || "No description provided for this event."}
                </p>
              </div>
            </div>

            {/* Flyers Showcase */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconPhoto className="size-4 text-muted-foreground" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Artwork & Flyers ({event.flyers?.length || 0})
                  </h3>
                </div>
                {event.flyers && event.flyers.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Click to zoom
                  </span>
                )}
              </div>

              {((event.flyers && event.flyers.length > 0) || event.badgeImage) ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {event.flyers?.map((flyerItem) => {
                    const resolvedSrc = getEventImageUrl(flyerItem.image)
                    return (
                      <FlyerCard
                        key={flyerItem.id}
                        src={resolvedSrc}
                        type={flyerItem.type}
                        onZoom={(src) => setPreviewImage(src)}
                      />
                    )
                  })}
                  {event.badgeImage && (
                    <FlyerCard
                      src={getEventImageUrl(event.badgeImage)}
                      type="badge template"
                      onZoom={(src) => setPreviewImage(src)}
                    />
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground">
                  No flyers attached to this event
                </div>
              )}
            </div>

            {/* Guest / Host Ministers */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <IconUser className="size-4 text-muted-foreground" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Ministers & Speakers ({event.ministers?.length || 0})
                </h3>
              </div>

              {event.ministers && event.ministers.length > 0 ? (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {event.ministers.map((m) => {
                    const name =
                      [m.firstName, m.lastName].filter(Boolean).join(" ") ||
                      "Minister"
                    const initials =
                      [m.firstName?.[0], m.lastName?.[0]]
                        .filter(Boolean)
                        .join("")
                        .toUpperCase() || "M"
                    return (
                      <div
                        key={m.id}
                        className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-xs"
                      >
                        <Avatar size="default">
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-foreground truncate">
                            {name}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {m.title || "Speaker"}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed py-4 text-center text-xs text-muted-foreground">
                  No ministers assigned yet
                </div>
              )}
            </div>

            {/* Registered Attendees / Reservations */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconTicket className="size-4 text-muted-foreground" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Attendee Reservations ({event.reservations?.length || 0})
                  </h3>
                </div>
                {event.reservations && event.reservations.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAttendeesDialogOpen(true)}
                    className="h-7 gap-1 px-2.5 text-xs font-medium text-primary hover:text-primary"
                  >
                    <IconUsers className="size-3.5" />
                    View Full Roster ({event.reservations.length})
                  </Button>
                )}
              </div>

              {event.reservations && event.reservations.length > 0 ? (
                <div className="flex flex-col gap-2 rounded-xl border bg-card p-3 shadow-xs max-h-60 overflow-y-auto">
                  {event.reservations.map((res) => {
                    const name =
                      [res.firstName, res.lastName].filter(Boolean).join(" ") ||
                      "Registered Guest"
                    const initials =
                      [res.firstName?.[0], res.lastName?.[0]]
                        .filter(Boolean)
                        .join("")
                        .toUpperCase() || "A"
                    const isOnline = res.attendanceMode === "online"
                    return (
                      <div
                        key={res.id}
                        className="flex items-center justify-between gap-2 border-b border-border/50 py-2.5 last:border-none text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar size="sm" className="size-7 shrink-0">
                            <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-foreground truncate">
                              {name}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate">
                              {res.email}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                              isOnline
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            )}
                          >
                            {isOnline ? "Online" : "In-Person"}
                          </span>
                          <span className="font-mono text-muted-foreground text-[11px] hidden sm:inline">
                            {res.phone}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground">
                  No reservations booked for this event yet
                </div>
              )}
            </div>
          </div>

          <Separator />

          <DrawerFooter className="flex-row items-center justify-between gap-2 p-4">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={loading}
            >
              <IconTrash className="mr-1.5 size-4" />
              Delete Event
            </Button>

            <div className="flex items-center gap-2">
              <DrawerClose render={<Button variant="outline" size="sm" />}>
                Close
              </DrawerClose>

              <Button
                size="sm"
                onClick={() => {
                  onEdit?.(event)
                }}
              >
                <IconEdit className="mr-1.5 size-4" />
                Edit Event
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Lightbox Modal for Full-Size Flyer Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative flex max-h-[92vh] max-w-4xl flex-col items-center gap-3 overflow-hidden rounded-2xl border bg-card p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex w-full items-center justify-between px-2 pt-1">
              <div className="flex items-center gap-2">
                <IconPhoto className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Event Flyer Preview
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition"
                >
                  <IconExternalLink className="size-3.5" />
                  Open Original
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-full text-muted-foreground hover:text-foreground"
                  onClick={() => setPreviewImage(null)}
                >
                  <IconX className="size-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
            </div>
            <div className="relative max-h-[78vh] overflow-hidden rounded-xl bg-black/10 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage}
                alt="Event flyer full preview"
                className="max-h-[78vh] w-auto max-w-full rounded-xl object-contain shadow-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the event &ldquo;
              <span className="font-semibold text-foreground">
                {event.theme}
              </span>
              &rdquo;? This will permanently delete the event along with all
              associated flyers, reservations, and minister connections.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={loading}
              onClick={handleDelete}
            >
              {loading ? "Deleting..." : "Delete Event"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dedicated Attendees Dialog */}
      <EventAttendeesDialog
        event={event}
        open={attendeesDialogOpen}
        onOpenChange={setAttendeesDialogOpen}
      />
    </>
  )
}
