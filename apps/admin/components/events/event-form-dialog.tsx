"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
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
import { Input } from "@repo/ui/components/input"
import { Label } from "@repo/ui/components/label"
import { Textarea } from "@repo/ui/components/textarea"
import {
  IconCalendarEvent,
  IconEdit,
  IconLoader,
  IconMoon,
  IconPhoto,
  IconPlus,
  IconRepeat,
  IconSun,
} from "@tabler/icons-react"
import { toast } from "sonner"
import {
  createEventAction,
  updateEventAction,
} from "@/lib/action/event"
import { ImageUploadField } from "./image-upload-field"
import type { AdminEventItem } from "./types"

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

interface EventFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: AdminEventItem | null
  onSuccess?: () => void
}

export function EventFormDialog({
  open,
  onOpenChange,
  event: editingEvent,
  onSuccess,
}: EventFormDialogProps) {
  const isMobile = useIsMobile()
  const [loading, setLoading] = React.useState(false)

  const isEditing = Boolean(editingEvent)

  // Form states
  const [theme, setTheme] = React.useState("")
  const [startDate, setStartDate] = React.useState("")
  const [endDate, setEndDate] = React.useState("")
  const [time, setTime] = React.useState("10:00")
  const [location, setLocation] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [desktopFlyer, setDesktopFlyer] = React.useState("")
  const [mobileFlyer, setMobileFlyer] = React.useState("")
  const [badgeTemplate, setBadgeTemplate] = React.useState("")
  const [ministerName, setMinisterName] = React.useState("")
  const [ministerTitle, setMinisterTitle] = React.useState("")
  const [ministerImage, setMinisterImage] = React.useState("")

  // Recurring & Session states
  const [isRecurring, setIsRecurring] = React.useState(false)
  const [recurringDays, setRecurringDays] = React.useState<string[]>([])
  const [hasMorningSession, setHasMorningSession] = React.useState(false)
  const [morningTime, setMorningTime] = React.useState("09:00")
  const [hasEveningSession, setHasEveningSession] = React.useState(false)
  const [eveningTime, setEveningTime] = React.useState("17:00")

  // Pre-fill fields when editingEvent changes
  React.useEffect(() => {
    if (editingEvent) {
      setTheme(editingEvent.theme || "")
      try {
        const s = new Date(editingEvent.startDate)
        setStartDate(s.toISOString().slice(0, 10))
      } catch {
        setStartDate("")
      }
      try {
        const e = new Date(editingEvent.endDate)
        setEndDate(e.toISOString().slice(0, 10))
      } catch {
        setEndDate("")
      }

      if (typeof editingEvent.time === "string") {
        if (/^\d{2}:\d{2}/.test(editingEvent.time)) {
          setTime(editingEvent.time.slice(0, 5))
        } else {
          setTime("10:00")
        }
      } else if (editingEvent.time) {
        try {
          const t = new Date(editingEvent.time)
          setTime(t.toISOString().slice(11, 16))
        } catch {
          setTime("10:00")
        }
      }

      setLocation(editingEvent.location || "")
      setDescription(editingEvent.description || "")

      setIsRecurring(Boolean(editingEvent.isRecurring))
      setRecurringDays(editingEvent.recurringDays || [])
      setHasMorningSession(Boolean(editingEvent.hasMorningSession))
      setMorningTime(editingEvent.morningTime || "09:00")
      setHasEveningSession(Boolean(editingEvent.hasEveningSession))
      setEveningTime(editingEvent.eveningTime || "17:00")

      const df = editingEvent.flyers?.find((f) => f.type === "desktop")
      const mf = editingEvent.flyers?.find((f) => f.type === "mobile")
      setDesktopFlyer(df?.image || "")
      setMobileFlyer(mf?.image || "")
      setBadgeTemplate(editingEvent.badgeImage || "")

      const m = editingEvent.ministers?.[0]
      setMinisterName(
        m ? [m.firstName, m.lastName].filter(Boolean).join(" ") : ""
      )
      setMinisterTitle(m?.title || "")
      setMinisterImage(m?.image || "")
    } else {
      // Default new event values
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextDay = new Date()
      nextDay.setDate(nextDay.getDate() + 2)

      setTheme("")
      setStartDate(tomorrow.toISOString().slice(0, 10))
      setEndDate(nextDay.toISOString().slice(0, 10))
      setTime("10:00")
      setLocation("Main Auditorium, Lagos")
      setDescription("")
      setDesktopFlyer("")
      setMobileFlyer("")
      setBadgeTemplate("")
      setMinisterName("")
      setMinisterTitle("")
      setMinisterImage("")
      setIsRecurring(false)
      setRecurringDays([])
      setHasMorningSession(false)
      setMorningTime("09:00")
      setHasEveningSession(false)
      setEveningTime("17:00")
    }
  }, [editingEvent, open])

  const toggleDay = (day: string) => {
    setRecurringDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!theme.trim()) {
      toast.error("Please provide an event title or theme.")
      return
    }
    if (!startDate || !endDate) {
      toast.error("Please set both start and end dates.")
      return
    }

    try {
      setLoading(true)

      // Format minister list if provided
      const ministersList: Array<{
        firstName?: string
        lastName?: string
        title?: string
        image?: string
      }> = []

      if (ministerName.trim()) {
        const parts = ministerName.trim().split(" ")
        const firstName = parts[0] || ""
        const lastName = parts.slice(1).join(" ") || ""
        ministersList.push({
          firstName,
          lastName,
          title: ministerTitle.trim() || undefined,
          image: ministerImage.trim() || undefined,
        })
      }

      if (isEditing && editingEvent) {
        const res = await updateEventAction({
          id: editingEvent.id,
          theme,
          startDate,
          endDate,
          time,
          location,
          description,
          desktopFlyer,
          mobileFlyer,
          badgeImage: badgeTemplate,
          isRecurring,
          recurringDays,
          hasMorningSession,
          morningTime: hasMorningSession ? morningTime : undefined,
          hasEveningSession,
          eveningTime: hasEveningSession ? eveningTime : undefined,
          ministers: ministersList,
        })

        if (res.success) {
          toast.success("Event updated successfully!")
          onSuccess?.()
          onOpenChange(false)
        } else {
          toast.error(res.error || "Failed to update event")
        }
      } else {
        const res = await createEventAction({
          theme,
          startDate,
          endDate,
          time,
          location,
          description,
          desktopFlyer,
          mobileFlyer,
          badgeImage: badgeTemplate,
          isRecurring,
          recurringDays,
          hasMorningSession,
          morningTime: hasMorningSession ? morningTime : undefined,
          hasEveningSession,
          eveningTime: hasEveningSession ? eveningTime : undefined,
          ministers: ministersList,
        })

        if (res.success) {
          toast.success("Event created successfully!")
          onSuccess?.()
          onOpenChange(false)
        } else {
          toast.error(res.error || "Failed to create event")
        }
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection={isMobile ? "down" : "right"}
    >
      <DrawerContent className="sm:max-w-xl">
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <DrawerHeader className="gap-1 border-b pb-4">
            <DrawerTitle className="flex items-center gap-2 text-xl font-semibold">
              {isEditing ? (
                <>
                  <IconEdit className="size-5 text-primary" />
                  Edit Event
                </>
              ) : (
                <>
                  <IconCalendarEvent className="size-5 text-primary" />
                  Create New Event
                </>
              )}
            </DrawerTitle>
            <DrawerDescription className="text-xs">
              {isEditing
                ? "Update event schedule, recurring rules, sessions, artwork flyers, and speakers."
                : "Schedule a church program, configure recurring weekly schedule and daily sessions."}
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6 text-xs">
            {/* Theme / Title */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="theme" className="text-xs font-medium">
                Event Title / Theme <span className="text-destructive">*</span>
              </Label>
              <Input
                id="theme"
                placeholder="e.g. Annual Holy Ghost Convention"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                required
              />
            </div>

            {/* Date Pickers */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="startDate" className="text-xs font-medium">
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="endDate" className="text-xs font-medium">
                  End Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Time & Location */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="time" className="text-xs font-medium">
                  Primary Event Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="location" className="text-xs font-medium">
                  Location / Venue
                </Label>
                <Input
                  id="location"
                  placeholder="e.g. Main Auditorium, Lagos or Online"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            {/* Recurring Gathering Section */}
            <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconRepeat className="size-4 text-amber-500" />
                  <Label htmlFor="isRecurring" className="text-xs font-semibold cursor-pointer">
                    Recurring / Recursive Event
                  </Label>
                </div>
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="size-4 rounded accent-primary cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Enable for recurring services that take place on regular days (e.g. every Tuesday, Sunday, and Wednesday).
              </p>

              {isRecurring && (
                <div className="flex flex-col gap-2.5 pt-2 border-t border-border/50">
                  <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Select Meeting Days
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = recurringDays.includes(day)
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                            isSelected
                              ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold ring-1 ring-amber-500/30"
                              : "border-border hover:border-muted-foreground/40 bg-card text-muted-foreground"
                          }`}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>

                  {/* Quick Presets */}
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1">
                    <span>Quick presets:</span>
                    <button
                      type="button"
                      onClick={() => setRecurringDays(["Tuesday", "Wednesday", "Sunday"])}
                      className="underline hover:text-foreground cursor-pointer"
                    >
                      Tue, Wed, Sun
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setRecurringDays(["Sunday"])}
                      className="underline hover:text-foreground cursor-pointer"
                    >
                      Every Sunday
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setRecurringDays(["Wednesday"])}
                      className="underline hover:text-foreground cursor-pointer"
                    >
                      Midweek Wed
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Daily Sessions (Morning & Evening) */}
            <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <IconSun className="size-4 text-amber-500" />
                  Morning & Evening Sessions
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Configure whether this event has separate morning and evening sessions, allowing attendees to register for their preferred time.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Morning Session */}
                <div className={`p-3 rounded-xl border transition-all ${hasMorningSession ? "border-amber-500/40 bg-amber-500/5" : "border-border/60 bg-card/60"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconSun className="size-4 text-amber-500" />
                      <Label htmlFor="hasMorningSession" className="text-xs font-semibold cursor-pointer">
                        Morning Session
                      </Label>
                    </div>
                    <input
                      type="checkbox"
                      id="hasMorningSession"
                      checked={hasMorningSession}
                      onChange={(e) => setHasMorningSession(e.target.checked)}
                      className="size-4 rounded accent-primary cursor-pointer"
                    />
                  </div>
                  {hasMorningSession && (
                    <div className="flex flex-col gap-1 mt-2">
                      <Label htmlFor="morningTime" className="text-[10px] text-muted-foreground">
                        Morning Start Time
                      </Label>
                      <Input
                        id="morningTime"
                        type="time"
                        value={morningTime}
                        onChange={(e) => setMorningTime(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  )}
                </div>

                {/* Evening Session */}
                <div className={`p-3 rounded-xl border transition-all ${hasEveningSession ? "border-indigo-500/40 bg-indigo-500/5" : "border-border/60 bg-card/60"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconMoon className="size-4 text-indigo-500" />
                      <Label htmlFor="hasEveningSession" className="text-xs font-semibold cursor-pointer">
                        Evening Session
                      </Label>
                    </div>
                    <input
                      type="checkbox"
                      id="hasEveningSession"
                      checked={hasEveningSession}
                      onChange={(e) => setHasEveningSession(e.target.checked)}
                      className="size-4 rounded accent-primary cursor-pointer"
                    />
                  </div>
                  {hasEveningSession && (
                    <div className="flex flex-col gap-1 mt-2">
                      <Label htmlFor="eveningTime" className="text-[10px] text-muted-foreground">
                        Evening Start Time
                      </Label>
                      <Input
                        id="eveningTime"
                        type="time"
                        value={eveningTime}
                        onChange={(e) => setEveningTime(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="description" className="text-xs font-medium">
                Description / Program Highlights
              </Label>
              <Textarea
                id="description"
                placeholder="Enter details about this program, schedule, sessions, and guidelines..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-24 text-sm leading-relaxed"
              />
            </div>

            {/* Artwork Flyers Section */}
            <div className="flex flex-col gap-4 rounded-xl border bg-muted/20 p-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <IconPhoto className="size-4 text-primary" />
                  Event Flyers & Artwork
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Upload high-resolution flyers directly to cloud storage.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ImageUploadField
                  label="Desktop Flyer (Landscape 16:9)"
                  description="Recommended: 1920×1080px (JPEG, PNG, WebP)"
                  folder="events/desktop"
                  aspectRatio="video"
                  value={desktopFlyer}
                  onChange={setDesktopFlyer}
                />

                <ImageUploadField
                  label="Mobile Flyer (Portrait 3:4)"
                  description="Recommended: 1080×1440px (JPEG, PNG, WebP)"
                  folder="events/mobile"
                  aspectRatio="portrait"
                  value={mobileFlyer}
                  onChange={setMobileFlyer}
                />
              </div>

              <div className="pt-2 border-t border-border/40">
                <ImageUploadField
                  label="Attendee Badge Template (Square / Photo Flyer)"
                  description="Background graphic for the attendee badge generator. Recommended: 1080×1080px (Square) with space for attendee photo & name."
                  folder="events/badges"
                  aspectRatio="square"
                  value={badgeTemplate}
                  onChange={setBadgeTemplate}
                />
              </div>
            </div>

            {/* Primary Speaker / Minister */}
            <div className="flex flex-col gap-4 rounded-xl border bg-muted/20 p-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Guest Speaker / Minister (Optional)
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Add minister or speaker profile details and photo.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="ministerName"
                    className="text-xs font-medium"
                  >
                    Minister Name
                  </Label>
                  <Input
                    id="ministerName"
                    placeholder="e.g. Pastor John Doe"
                    value={ministerName}
                    onChange={(e) => setMinisterName(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="ministerTitle"
                    className="text-xs font-medium"
                  >
                    Title / Role
                  </Label>
                  <Input
                    id="ministerTitle"
                    placeholder="e.g. Keynote Speaker"
                    value={ministerTitle}
                    onChange={(e) => setMinisterTitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="w-full sm:max-w-xs">
                <ImageUploadField
                  label="Minister Photo (Headshot)"
                  description="Square photo (JPEG, PNG, WebP)"
                  folder="ministers"
                  aspectRatio="square"
                  value={ministerImage}
                  onChange={setMinisterImage}
                />
              </div>
            </div>
          </div>

          <DrawerFooter className="flex-row items-center justify-end gap-2 border-t p-4">
            <DrawerClose render={<Button variant="outline" size="sm" />}>
              Cancel
            </DrawerClose>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? (
                <>
                  <IconLoader className="mr-1.5 size-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Event"
              )}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
