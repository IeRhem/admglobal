"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
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
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  cn,
  csvCell,
  formatDateTime,
  formatEventDateRange,
  getBadgePhotoUrl,
} from "@/lib/utils";
import type { AdminEventItem, EventReservationItem } from "./types";

interface EventAttendeesDialogProps {
  event: AdminEventItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventAttendeesDialog({
  event,
  open,
  onOpenChange,
}: EventAttendeesDialogProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [modeFilter, setModeFilter] = React.useState<
    "all" | "in-person" | "online"
  >("all");
  const [sessionFilter, setSessionFilter] = React.useState<
    "all" | "morning" | "evening" | "both"
  >("all");
  const [badgePreview, setBadgePreview] = React.useState<string | null>(null);

  // Reset filters when event changes or dialog opens
  React.useEffect(() => {
    if (open) {
      setSearchQuery("");
      setModeFilter("all");
      setSessionFilter("all");
      setBadgePreview(null);
    }
  }, [open, event?.id]);

  if (!event) return null;

  const reservations = event.reservations || [];

  // Count stats
  const totalCount = reservations.length;
  const inPersonCount = reservations.filter(
    (r) => (r.attendanceMode || "in-person").toLowerCase() === "in-person",
  ).length;
  const onlineCount = reservations.filter(
    (r) => (r.attendanceMode || "").toLowerCase() === "online",
  ).length;

  // Filtered reservations
  const filteredReservations = reservations.filter((r) => {
    const mode = (r.attendanceMode || "in-person").toLowerCase();
    if (modeFilter === "in-person" && mode !== "in-person") return false;
    if (modeFilter === "online" && mode !== "online") return false;

    const session = (r.session || "both").toLowerCase();
    if (sessionFilter !== "all" && session !== sessionFilter) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const fullName = `${r.firstName || ""} ${r.lastName || ""}`.toLowerCase();
    const email = (r.email || "").toLowerCase();
    const phone = (r.phone || "").toLowerCase();
    const day = (r.preferredDay || "").toLowerCase();

    return (
      fullName.includes(q) ||
      email.includes(q) ||
      phone.includes(q) ||
      day.includes(q) ||
      session.includes(q)
    );
  });

  // Export CSV
  const handleExportCSV = () => {
    if (reservations.length === 0) {
      toast.error("No attendees to export");
      return;
    }

    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Attendance Mode",
      "Session Choice",
      "Scheduled Day",
      "Registered At",
    ];

    const csvRows = reservations.map((r) => {
      const mode = r.attendanceMode || "in-person";
      const dateStr = r.createdAt ? new Date(r.createdAt).toISOString() : "";
      return [
        csvCell(r.firstName || ""),
        csvCell(r.lastName || ""),
        csvCell(r.email || ""),
        csvCell(r.phone || ""),
        csvCell(mode),
        csvCell(r.session || "both"),
        csvCell(r.preferredDay || ""),
        csvCell(dateStr),
      ].join(",");
    });

    const csvContent = [headers.map(csvCell).join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeTitle = event.theme
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");
    link.href = url;
    link.setAttribute("download", `${safeTitle}-attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${reservations.length} attendees to CSV`);
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const eventDates = formatEventDateRange(event.startDate, event.endDate);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl sm:max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
          {/* Header */}
          <DialogHeader className="p-5 border-b bg-muted/20">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <IconTicket className="size-4" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Registered Attendees
                </span>

                {event.isRecurring &&
                  event.recurringDays &&
                  event.recurringDays.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      <IconRepeat className="size-3" />
                      Every {event.recurringDays.join(", ")}
                    </span>
                  )}

                {(event.hasMorningSession || event.hasEveningSession) && (
                  <span className="rounded-full bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                    {event.hasMorningSession && event.hasEveningSession
                      ? `Morning (${event.morningTime || "09:00"}) & Evening (${event.eveningTime || "17:00"})`
                      : event.hasMorningSession
                        ? `Morning Session (${event.morningTime})`
                        : `Evening Session (${event.eveningTime})`}
                  </span>
                )}
              </div>

              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                {event.theme}
              </DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {eventDates && (
                  <span className="inline-flex items-center gap-1">
                    <IconCalendarEvent className="size-3.5" />
                    {eventDates}
                  </span>
                )}
                {event.location && (
                  <span className="inline-flex items-center gap-1">
                    <IconMapPin className="size-3.5" />
                    {event.location}
                  </span>
                )}
              </DialogDescription>
            </div>

            {/* Quick summary metrics */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-xs font-medium px-2.5 py-1"
                >
                  Total:{" "}
                  <strong className="ml-1 text-foreground">{totalCount}</strong>
                </Badge>
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs px-2.5 py-1 font-medium"
                >
                  In-Person: <strong className="ml-1">{inPersonCount}</strong>
                </Badge>
                <Badge
                  variant="outline"
                  className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs px-2.5 py-1 font-medium"
                >
                  Online: <strong className="ml-1">{onlineCount}</strong>
                </Badge>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={totalCount === 0}
                className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
              >
                <IconDownload className="size-3.5" />
                Export CSV ({totalCount})
              </Button>
            </div>
          </DialogHeader>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-5 py-3 border-b bg-background">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search attendee by name, email, phone, session, or day..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 text-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <IconX className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={sessionFilter}
                onValueChange={(val) =>
                  setSessionFilter(
                    (val as "all" | "morning" | "evening" | "both") || "all",
                  )
                }
              >
                <SelectTrigger className="h-9 text-xs min-w-[125px]">
                  <SelectValue placeholder="All Sessions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>

              <Tabs
                value={modeFilter}
                onValueChange={(val) =>
                  setModeFilter(val as "all" | "in-person" | "online")
                }
                className="w-auto"
              >
                <TabsList className="h-9 p-1">
                  <TabsTrigger value="all" className="text-xs px-3">
                    All ({totalCount})
                  </TabsTrigger>
                  <TabsTrigger value="in-person" className="text-xs px-3">
                    In-Person ({inPersonCount})
                  </TabsTrigger>
                  <TabsTrigger value="online" className="text-xs px-3">
                    Online ({onlineCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Attendees List / Table */}
          <div className="flex-1 overflow-y-auto p-5">
            {filteredReservations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-3">
                  <IconUser className="size-6" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">
                  {reservations.length === 0
                    ? "No registered attendees yet"
                    : "No matching attendees"}
                </h4>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  {reservations.length === 0
                    ? "When church members or guests register for this event, their details, attendance mode, and sessions will appear here."
                    : "Try adjusting your search query or mode filter to locate attendee records."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredReservations.map((res) => {
                  const name =
                    [res.firstName, res.lastName].filter(Boolean).join(" ") ||
                    "Guest Attendee";
                  const initials =
                    [res.firstName?.[0], res.lastName?.[0]]
                      .filter(Boolean)
                      .join("")
                      .toUpperCase() || "A";
                  const isOnline =
                    (res.attendanceMode || "").toLowerCase() === "online";
                  const registeredDate = formatDateTime(res.createdAt);
                  const badgePhotoUrl = res.badgePhoto
                    ? getBadgePhotoUrl(res.badgePhoto)
                    : null;
                  const sessionVal = (res.session || "both").toLowerCase();

                  return (
                    <div
                      key={res.id}
                      className="group flex flex-col justify-between rounded-xl border bg-card p-3.5 text-xs shadow-xs transition hover:border-primary/40 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <Avatar size="default" className="size-10 shrink-0">
                            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-foreground text-sm truncate">
                              {name}
                            </span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              Registered: {registeredDate || "Recently"}
                            </span>
                          </div>
                        </div>

                        {/* Attendance Mode badge */}
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider shrink-0",
                            isOnline
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
                          )}
                        >
                          {isOnline ? "Online" : "In-Person"}
                        </span>
                      </div>

                      {/* Session and Recurring Day Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-border/40">
                        {sessionVal === "morning" && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                            <IconSun className="size-3" />
                            Morning Session
                          </span>
                        )}
                        {sessionVal === "evening" && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                            <IconMoon className="size-3" />
                            Evening Session
                          </span>
                        )}
                        {(sessionVal === "both" || sessionVal === "all") && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                            <IconSparkles className="size-3" />
                            Both Sessions
                          </span>
                        )}

                        {res.preferredDay && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-border/80 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground font-medium">
                            <IconRepeat className="size-2.5 text-amber-500" />
                            {res.preferredDay}
                          </span>
                        )}
                      </div>

                      {/* Contact details */}
                      <div className="flex flex-col gap-1.5 mt-2.5 pt-2.5 border-t border-border/50 text-[11px]">
                        <div className="flex items-center justify-between gap-2">
                          <a
                            href={`mailto:${res.email}`}
                            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground truncate transition"
                            title={res.email}
                          >
                            <IconMail className="size-3.5 shrink-0 text-muted-foreground/70" />
                            <span className="truncate">{res.email}</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopyText(res.email, "Email")}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition p-0.5 cursor-pointer"
                            title="Copy email"
                          >
                            <IconCopy className="size-3" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <a
                            href={`tel:${res.phone}`}
                            className="flex items-center gap-1.5 font-mono text-muted-foreground hover:text-foreground truncate transition"
                            title={res.phone}
                          >
                            <IconPhone className="size-3.5 shrink-0 text-muted-foreground/70" />
                            <span className="truncate">{res.phone}</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopyText(res.phone, "Phone")}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition p-0.5 cursor-pointer"
                            title="Copy phone"
                          >
                            <IconCopy className="size-3" />
                          </button>
                        </div>
                      </div>

                      {/* Attendee badge photo preview if available */}
                      {badgePhotoUrl && (
                        <div className="mt-2.5 pt-2 border-t border-dashed flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <IconPhoto className="size-3" />
                            Custom Badge Photo
                          </span>
                          <button
                            type="button"
                            onClick={() => setBadgePreview(badgePhotoUrl)}
                            className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <IconZoomIn className="size-3" />
                            Preview Badge
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
  );
}
