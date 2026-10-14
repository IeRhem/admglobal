"use client"

import * as React from "react"
import { Badge } from "@repo/ui/components/badge"
import { Button } from "@repo/ui/components/button"
import { Input } from "@repo/ui/components/input"
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar"
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table"
import {
  IconCalendarEvent,
  IconCopy,
  IconDownload,
  IconMail,
  IconMapPin,
  IconMoon,
  IconPhone,
  IconPhoto,
  IconRepeat,
  IconSearch,
  IconSparkles,
  IconSun,
  IconTicket,
  IconUser,
  IconX,
  IconZoomIn,
} from "@tabler/icons-react"
import { toast } from "sonner"
import {
  cn,
  csvCell,
  formatDateTime,
  formatEventDateRange,
  getBadgePhotoUrl,
} from "@/lib/utils"

export interface DashboardAttendeeItem {
  id: string
  eventId: string
  firstName: string | null
  lastName: string | null
  email: string
  phone: string
  attendanceMode: string | null
  session?: string | null
  preferredDay?: string | null
  badgePhoto: string | null
  createdAt: string | Date
  eventTheme: string | null
  eventStartDate: string | Date | null
  eventLocation: string | null
}

interface RecentRegistrationsTableProps {
  registrations: DashboardAttendeeItem[]
  eventTitles?: { id: string; theme: string }[]
}

export function RecentRegistrationsTable({
  registrations,
  eventTitles = [],
}: RecentRegistrationsTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [modeFilter, setModeFilter] = React.useState<"all" | "in-person" | "online">("all")
  const [sessionFilter, setSessionFilter] = React.useState<"all" | "morning" | "evening" | "both">("all")
  const [selectedEventId, setSelectedEventId] = React.useState<string>("all")
  const [badgePreview, setBadgePreview] = React.useState<string | null>(null)
  const [pageSize, setPageSize] = React.useState<number>(10)
  const [currentPage, setCurrentPage] = React.useState<number>(1)

  // Filter dataset
  const filtered = React.useMemo(() => {
    return registrations.filter((r) => {
      // Event filter
      if (selectedEventId !== "all" && r.eventId !== selectedEventId) {
        return false
      }

      // Mode filter
      const mode = (r.attendanceMode || "in-person").toLowerCase()
      if (modeFilter === "in-person" && mode !== "in-person") return false
      if (modeFilter === "online" && mode !== "online") return false

      // Session filter
      const session = (r.session || "both").toLowerCase()
      if (sessionFilter !== "all" && session !== sessionFilter) {
        return false
      }

      // Search query
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      const fullName = `${r.firstName || ""} ${r.lastName || ""}`.toLowerCase()
      const email = (r.email || "").toLowerCase()
      const phone = (r.phone || "").toLowerCase()
      const theme = (r.eventTheme || "").toLowerCase()
      const day = (r.preferredDay || "").toLowerCase()

      return (
        fullName.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        theme.includes(q) ||
        day.includes(q) ||
        session.includes(q)
      )
    })
  }, [registrations, selectedEventId, modeFilter, sessionFilter, searchQuery])

  // Reset to page 1 on search / filter changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, modeFilter, sessionFilter, selectedEventId])

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const paginatedRows = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.error("No registrations to export")
      return
    }

    const headers = [
      "Attendee Name",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Attendance Mode",
      "Session",
      "Scheduled Day",
      "Event Registered For",
      "Registration Date",
    ]

    const csvRows = filtered.map((r) => {
      const name = [r.firstName, r.lastName].filter(Boolean).join(" ") || "Guest"
      const dateStr = r.createdAt ? new Date(r.createdAt).toISOString() : ""
      return [
        csvCell(name),
        csvCell(r.firstName || ""),
        csvCell(r.lastName || ""),
        csvCell(r.email || ""),
        csvCell(r.phone || ""),
        csvCell(r.attendanceMode || "in-person"),
        csvCell(r.session || "both"),
        csvCell(r.preferredDay || ""),
        csvCell(r.eventTheme || ""),
        csvCell(dateStr),
      ].join(",")
    })

    const csvContent = [headers.map(csvCell).join(","), ...csvRows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `adm-event-registrations-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success(`Exported ${filtered.length} registrations to CSV`)
  }

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard`)
    } catch {
      toast.error(`Failed to copy ${label.toLowerCase()} to clipboard`)
    }
  }

  // Summary counts
  const totalCount = registrations.length
  const inPersonCount = registrations.filter(
    (r) => (r.attendanceMode || "in-person").toLowerCase() === "in-person"
  ).length
  const onlineCount = registrations.filter(
    (r) => (r.attendanceMode || "").toLowerCase() === "online"
  ).length

  return (
    <>
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:p-6 shadow-xs">
        {/* Table Title Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <IconTicket className="size-4" />
              </span>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Registered Attendees Roster
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Review who has registered across all church events, attendance mode (live/online), sessions, and contact details.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1">
              Total: <strong className="ml-1 text-foreground">{totalCount}</strong>
            </Badge>
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs px-2.5 py-1 font-semibold"
            >
              In-Person: <strong className="ml-1">{inPersonCount}</strong>
            </Badge>
            <Badge
              variant="outline"
              className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs px-2.5 py-1 font-semibold"
            >
              Online: <strong className="ml-1">{onlineCount}</strong>
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={filtered.length === 0}
              className="h-8 gap-1.5 text-xs font-medium ml-1"
            >
              <IconDownload className="size-3.5" />
              Export CSV ({filtered.length})
            </Button>
          </div>
        </div>

        {/* Toolbar: Search & Multi-Filters */}
        <div className="flex flex-col gap-2.5 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            {/* Search Input */}
            <div className="relative sm:col-span-5">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search attendee by name, email, phone, or day..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 text-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <IconX className="size-3.5" />
                </button>
              )}
            </div>

            {/* Event Filter */}
            {eventTitles.length > 0 && (
              <div className="sm:col-span-4">
                <Select
                  value={selectedEventId}
                  onValueChange={(val) => setSelectedEventId(val || "all")}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="All Events" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events ({registrations.length})</SelectItem>
                    {eventTitles.map((ev) => (
                      <SelectItem key={ev.id} value={ev.id}>
                        {ev.theme}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Mode Filter Tabs */}
            <div className="sm:col-span-3">
              <Tabs
                value={modeFilter}
                onValueChange={(val) => setModeFilter(val as any)}
                className="w-full"
              >
                <TabsList className="h-9 p-1 w-full">
                  <TabsTrigger value="all" className="text-xs px-2 flex-1">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="in-person" className="text-xs px-2 flex-1">
                    In-Person
                  </TabsTrigger>
                  <TabsTrigger value="online" className="text-xs px-2 flex-1">
                    Online
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Session filter pills */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground overflow-x-auto pb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider shrink-0 mr-1">
              Session:
            </span>
            <button
              type="button"
              onClick={() => setSessionFilter("all")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                sessionFilter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 hover:bg-muted text-muted-foreground"
              }`}
            >
              All Sessions
            </button>
            <button
              type="button"
              onClick={() => setSessionFilter("morning")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 cursor-pointer ${
                sessionFilter === "morning"
                  ? "bg-amber-500 text-neutral-950 font-semibold"
                  : "bg-muted/60 hover:bg-muted text-muted-foreground"
              }`}
            >
              <IconSun className="size-3" />
              Morning
            </button>
            <button
              type="button"
              onClick={() => setSessionFilter("evening")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 cursor-pointer ${
                sessionFilter === "evening"
                  ? "bg-indigo-600 text-white font-semibold"
                  : "bg-muted/60 hover:bg-muted text-muted-foreground"
              }`}
            >
              <IconMoon className="size-3" />
              Evening
            </button>
            <button
              type="button"
              onClick={() => setSessionFilter("both")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 cursor-pointer ${
                sessionFilter === "both"
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-muted/60 hover:bg-muted text-muted-foreground"
              }`}
            >
              <IconSparkles className="size-3" />
              Both / Full Day
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="text-xs font-semibold">Attendee</TableHead>
                <TableHead className="text-xs font-semibold">Event</TableHead>
                <TableHead className="text-xs font-semibold">Attendance Mode</TableHead>
                <TableHead className="text-xs font-semibold">Session & Schedule</TableHead>
                <TableHead className="text-xs font-semibold">Phone</TableHead>
                <TableHead className="text-xs font-semibold">Registered At</TableHead>
                <TableHead className="text-xs font-semibold text-right">Badge Photo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-36 text-center">
                    <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                      <IconUser className="size-6 text-muted-foreground/60" />
                      <span className="text-xs font-medium text-foreground">
                        {registrations.length === 0
                          ? "No attendees have registered yet"
                          : "No matching registrations found"}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {registrations.length === 0
                          ? "When guests register on the event page, their registration records will populate here."
                          : "Try resetting your search query or filters."}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((r) => {
                  const name =
                    [r.firstName, r.lastName].filter(Boolean).join(" ") ||
                    "Guest Attendee"
                  const initials =
                    [r.firstName?.[0], r.lastName?.[0]]
                      .filter(Boolean)
                      .join("")
                      .toUpperCase() || "A"
                  const isOnline =
                    (r.attendanceMode || "").toLowerCase() === "online"
                  const registeredDate = formatDateTime(r.createdAt)
                  const badgePhotoUrl = r.badgePhoto
                    ? getBadgePhotoUrl(r.badgePhoto)
                    : null
                  const sessionVal = (r.session || "both").toLowerCase()

                  return (
                    <TableRow key={r.id} className="hover:bg-muted/20">
                      {/* Attendee Name & Email */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar size="sm" className="size-8 shrink-0">
                            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-foreground text-xs truncate">
                              {name}
                            </span>
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <span className="truncate">{r.email}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(r.email, "Email")}
                                className="text-muted-foreground/60 hover:text-foreground transition cursor-pointer"
                                title="Copy email"
                              >
                                <IconCopy className="size-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Event Theme */}
                      <TableCell className="py-3">
                        <div className="flex flex-col min-w-0 max-w-52">
                          <span className="text-xs font-medium text-foreground truncate" title={r.eventTheme || "Event"}>
                            {r.eventTheme || "Event"}
                          </span>
                          {r.eventLocation && (
                            <span className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                              <IconMapPin className="size-3 shrink-0" />
                              {r.eventLocation}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Attendance Mode */}
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] uppercase font-semibold tracking-wider",
                            isOnline
                              ? "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          )}
                        >
                          {isOnline ? "Online" : "In-Person"}
                        </Badge>
                      </TableCell>

                      {/* Session & Schedule */}
                      <TableCell className="py-3">
                        <div className="flex flex-col gap-1 items-start">
                          {sessionVal === "morning" && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                              <IconSun className="size-3" />
                              Morning
                            </span>
                          )}
                          {sessionVal === "evening" && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                              <IconMoon className="size-3" />
                              Evening
                            </span>
                          )}
                          {(sessionVal === "both" || sessionVal === "all") && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              <IconSparkles className="size-3" />
                              Both Sessions
                            </span>
                          )}

                          {r.preferredDay && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                              <IconRepeat className="size-2.5 text-amber-500" />
                              {r.preferredDay}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Phone Number */}
                      <TableCell className="py-3 font-mono text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <span>{r.phone}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(r.phone, "Phone")}
                            className="text-muted-foreground/60 hover:text-foreground transition cursor-pointer"
                            title="Copy phone"
                          >
                            <IconCopy className="size-3" />
                          </button>
                        </div>
                      </TableCell>

                      {/* Registered Date */}
                      <TableCell className="py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {registeredDate || "Recently"}
                      </TableCell>

                      {/* Badge Photo Preview */}
                      <TableCell className="py-3 text-right">
                        {badgePhotoUrl ? (
                          <button
                            type="button"
                            onClick={() => setBadgePreview(badgePhotoUrl)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
                          >
                            <IconPhoto className="size-3.5" />
                            Preview
                          </button>
                        ) : (
                          <span className="text-[11px] text-muted-foreground/60">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination & Row Count Footer */}
        {filtered.length > pageSize && (
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span>
              Showing {Math.min((currentPage - 1) * pageSize + 1, filtered.length)} to{" "}
              {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} attendees
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-7 text-xs"
              >
                Previous
              </Button>
              <span className="px-1 text-xs">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-7 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox for attendee badge photo */}
      {badgePreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
          onClick={() => setBadgePreview(null)}
        >
          <div
            className="relative max-w-sm w-full overflow-hidden rounded-2xl bg-card border shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setBadgePreview(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-1.5 text-white backdrop-blur-xs hover:bg-black/80 cursor-pointer"
            >
              <IconX className="size-4" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={badgePreview}
              alt="Attendee Badge"
              className="w-full rounded-xl object-contain max-h-[70vh]"
            />
          </div>
        </div>
      )}
    </>
  )
}
