"use client"

import * as React from "react"
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  FlexRender,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type SortingState,
} from "@tanstack/react-table"
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar"
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
import { Badge } from "@repo/ui/components/badge"
import { Button } from "@repo/ui/components/button"
import { Checkbox } from "@repo/ui/components/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu"
import { Input } from "@repo/ui/components/input"
import { Label } from "@repo/ui/components/label"
import {
  Select,
  SelectContent,
  SelectGroup,
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
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs"
import {
  IconCalendarEvent,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconClock,
  IconColumns,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconLoader,
  IconMapPin,
  IconPhoto,
  IconPlus,
  IconRepeat,
  IconSearch,
  IconTicket,
  IconTrash,
  IconX,
} from "@tabler/icons-react"
import { toast } from "sonner"
import {
  bulkDeleteEventsAction,
  deleteEventAction,
} from "@/lib/action/event"
import {
  cn,
  formatEventDateRange,
  formatEventTime,
  getEventImageUrl,
} from "@/lib/utils"
import { EventDrawer } from "./event-drawer"
import { EventFormDialog } from "./event-form-dialog"
import { EventAttendeesDialog } from "./event-attendees-dialog"
import type { AdminEventItem } from "./types"

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
})

const columnHelper = createColumnHelper<typeof features, AdminEventItem>()

interface EventsTableProps {
  initialData: AdminEventItem[]
}

export function EventsTable({ initialData }: EventsTableProps) {
  const [data, setData] = React.useState<AdminEventItem[]>(initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "startDate", desc: false },
  ])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const [activeTab, setActiveTab] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedEvent, setSelectedEvent] =
    React.useState<AdminEventItem | null>(null)
  const [editingEvent, setEditingEvent] =
    React.useState<AdminEventItem | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false)
  const [attendeesEvent, setAttendeesEvent] =
    React.useState<AdminEventItem | null>(null)
  const [isAttendeesModalOpen, setIsAttendeesModalOpen] = React.useState(false)

  // Dialog states for single and bulk delete
  const [eventToDelete, setEventToDelete] =
    React.useState<AdminEventItem | null>(null)
  const [isDeletingSingle, setIsDeletingSingle] = React.useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = React.useState(false)
  const [isBulkActionLoading, setIsBulkActionLoading] = React.useState(false)

  // Sync initialData updates
  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  const now = new Date()

  // Filter dataset by activeTab and searchQuery
  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      const end = new Date(item.endDate)
      const start = new Date(item.startDate)

      const isUpcoming = end >= now
      const isPast = end < now

      // Tab filter
      if (activeTab === "upcoming" && !isUpcoming) return false
      if (activeTab === "past" && !isPast) return false
      if (
        activeTab === "reservations" &&
        (!item.reservations || item.reservations.length === 0)
      ) {
        return false
      }

      // Search filter
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase()
      const theme = item.theme.toLowerCase()
      const location = (item.location || "").toLowerCase()
      const description = (item.description || "").toLowerCase()
      const ministers = (item.ministers || [])
        .map((m) => `${m.firstName || ""} ${m.lastName || ""}`.toLowerCase())
        .join(" ")

      return (
        theme.includes(query) ||
        location.includes(query) ||
        description.includes(query) ||
        ministers.includes(query)
      )
    })
  }, [data, activeTab, searchQuery, now])

  // Tab counts
  const upcomingCount = React.useMemo(() => {
    return data.filter((e) => new Date(e.endDate) >= now).length
  }, [data, now])

  const pastCount = React.useMemo(() => {
    return data.filter((e) => new Date(e.endDate) < now).length
  }, [data, now])

  const reservationsCount = React.useMemo(() => {
    return data.filter((e) => e.reservations && e.reservations.length > 0)
      .length
  }, [data])

  const handleOpenDetails = React.useCallback((item: AdminEventItem) => {
    setSelectedEvent(item)
    setIsDrawerOpen(true)
  }, [])

  const handleOpenEdit = React.useCallback((item: AdminEventItem) => {
    setEditingEvent(item)
    setIsFormModalOpen(true)
  }, [])

  const handleQuickDelete = React.useCallback((item: AdminEventItem) => {
    setEventToDelete(item)
  }, [])

  const confirmSingleDelete = async () => {
    if (!eventToDelete) return
    try {
      setIsDeletingSingle(true)
      const res = await deleteEventAction(eventToDelete.id)
      if (res.success) {
        setData((prev) => prev.filter((e) => e.id !== eventToDelete.id))
        toast.success("Event deleted successfully")
        setEventToDelete(null)
      } else {
        toast.error(res.error || "Delete failed")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsDeletingSingle(false)
    }
  }

  const columns = React.useMemo(
    () =>
      columnHelper.columns([
        // Multi-select Checkbox
        columnHelper.display({
          id: "select",
          header: ({ table }) => (
            <div className="flex items-center justify-center">
              <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                indeterminate={
                  table.getIsSomePageRowsSelected() &&
                  !table.getIsAllPageRowsSelected()
                }
                onCheckedChange={(val) =>
                  table.toggleAllPageRowsSelected(!!val)
                }
                aria-label="Select all"
              />
            </div>
          ),
          cell: ({ row }) => (
            <div className="flex items-center justify-center">
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(val) => row.toggleSelected(!!val)}
                aria-label="Select row"
              />
            </div>
          ),
          enableSorting: false,
          enableHiding: false,
        }),

        // Flyer Artwork Thumbnail
        columnHelper.display({
          id: "flyer",
          header: "Flyer",
          cell: ({ row }) => {
            const flyers = row.original.flyers || []
            const flyerItem =
              flyers.find((f) => f.type === "desktop") || flyers[0]
            const imageSrc = flyerItem?.image || row.original.badgeImage

            if (!imageSrc) {
              return (
                <div className="flex size-10 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground/60">
                  <IconPhoto className="size-4" />
                </div>
              )
            }

            const resolvedSrc = getEventImageUrl(imageSrc)
            return (
              <button
                type="button"
                onClick={() => handleOpenDetails(row.original)}
                className="group relative flex size-10 shrink-0 overflow-hidden rounded-lg border bg-muted shadow-2xs transition hover:scale-105 hover:ring-2 hover:ring-primary/40 focus:outline-none"
                title="Click to view full event"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolvedSrc}
                  alt={row.original.theme}
                  loading="lazy"
                  className="size-full object-cover transition group-hover:opacity-90"
                  onError={(e) => {
                    const target = e.currentTarget
                    target.style.display = "none"
                    if (target.parentElement) {
                      target.parentElement.innerHTML =
                        "<div class='flex size-full items-center justify-center bg-muted text-[10px] text-muted-foreground'>Flyer</div>"
                    }
                  }}
                />
              </button>
            )
          },
        }),

        // Event Theme & Description
        columnHelper.accessor("theme", {
          header: "Event Theme / Program",
          cell: ({ row }) => {
            const item = row.original
            return (
              <div className="flex flex-col gap-0.5 max-w-xs md:max-w-sm">
                <button
                  type="button"
                  onClick={() => handleOpenDetails(item)}
                  className="text-left font-medium text-foreground hover:text-primary transition line-clamp-1"
                >
                  {item.theme}
                </button>
                {item.description ? (
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {item.description}
                  </span>
                ) : (
                  <span className="text-xs italic text-muted-foreground/60">
                    No description
                  </span>
                )}
              </div>
            )
          },
        }),

        // Schedule / Date Range
        columnHelper.accessor("startDate", {
          header: "Date Schedule",
          sortFn: (rowA: any, rowB: any, columnId: string): number => {
            const dateA = new Date(rowA.getValue(columnId) as string | Date).getTime() || 0
            const dateB = new Date(rowB.getValue(columnId) as string | Date).getTime() || 0
            return dateA - dateB
          },
          cell: ({ row }) => {
            const item = row.original
            const dateRange = formatEventDateRange(
              item.startDate,
              item.endDate
            )
            const timeStr = formatEventTime(item.time)
            return (
              <div className="flex flex-col text-xs">
                <span className="font-medium text-foreground">
                  {dateRange || "TBA"}
                </span>
                <span className="text-muted-foreground flex items-center gap-1 mt-0.5">
                  <IconClock className="size-3 shrink-0" />
                  {timeStr || "Time TBA"}
                </span>
                {item.isRecurring && item.recurringDays && item.recurringDays.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                    <IconRepeat className="size-2.5" />
                    Every {item.recurringDays.join(", ")}
                  </span>
                )}
                {item.hasMorningSession && item.hasEveningSession && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                    Morning & Evening
                  </span>
                )}
              </div>
            )
          },
        }),

        // Location / Venue
        columnHelper.accessor("location", {
          header: "Venue",
          cell: ({ row }) => {
            const loc = row.original.location
            if (!loc) {
              return (
                <span className="text-xs italic text-muted-foreground">
                  TBA
                </span>
              )
            }
            return (
              <div className="flex items-center gap-1.5 text-xs max-w-44 truncate text-muted-foreground">
                <IconMapPin className="size-3.5 shrink-0 text-muted-foreground/70" />
                <span className="truncate" title={loc}>
                  {loc}
                </span>
              </div>
            )
          },
        }),

        // Status Badge
        columnHelper.display({
          id: "status",
          header: "Status",
          cell: ({ row }) => {
            const item = row.original
            const end = new Date(item.endDate)
            const start = new Date(item.startDate)

            const isToday =
              now.getFullYear() === start.getFullYear() &&
              now.getMonth() === start.getMonth() &&
              now.getDate() === start.getDate()
            const isUpcoming = end >= now

            if (isToday) {
              return (
                <Badge
                  variant="outline"
                  className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-[11px]"
                >
                  Happening Today
                </Badge>
              )
            }
            if (isUpcoming) {
              return (
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px]"
                >
                  Upcoming
                </Badge>
              )
            }
            return (
              <Badge
                variant="outline"
                className="text-muted-foreground text-[11px]"
              >
                Past Event
              </Badge>
            )
          },
        }),

        // Reservations Count
        columnHelper.display({
          id: "reservations",
          header: "Reservations",
          cell: ({ row }) => {
            const item = row.original
            const count = item.reservations?.length || 0
            return (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setAttendeesEvent(item)
                    setIsAttendeesModalOpen(true)
                  }}
                  className="group inline-flex items-center"
                  title="Click to view registered attendees"
                >
                  <Badge
                    variant="secondary"
                    className={cn(
                      "cursor-pointer transition hover:ring-2 hover:ring-primary/20",
                      count > 0
                        ? "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20"
                        : "text-muted-foreground group-hover:bg-muted"
                    )}
                  >
                    <IconTicket className="size-3 mr-1" />
                    {count}
                  </Badge>
                </button>
              </div>
            )
          },
        }),

        // Ministers
        columnHelper.display({
          id: "ministers",
          header: "Speakers",
          cell: ({ row }) => {
            const ministers = row.original.ministers || []
            if (ministers.length === 0) {
              return (
                <span className="text-xs text-muted-foreground/60">—</span>
              )
            }
            return (
              <div className="flex items-center -space-x-2 overflow-hidden">
                {ministers.slice(0, 3).map((m, idx) => {
                  const name =
                    [m.firstName, m.lastName].filter(Boolean).join(" ") ||
                    "Minister"
                  const initial =
                    m.firstName?.[0] || m.lastName?.[0] || "M"
                  return (
                    <Avatar
                      key={m.id || idx}
                      size="sm"
                      className="ring-2 ring-background"
                      title={name}
                    >
                      <AvatarFallback className="text-[10px]">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                  )
                })}
                {ministers.length > 3 && (
                  <div className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground ring-2 ring-background">
                    +{ministers.length - 3}
                  </div>
                )}
              </div>
            )
          },
        }),

        // Row Action Dropdown
        columnHelper.display({
          id: "actions",
          header: () => <div className="text-right">Actions</div>,
          cell: ({ row }) => {
            const item = row.original
            return (
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-foreground"
                      />
                    }
                  >
                    <IconDotsVertical className="size-4" />
                    <span className="sr-only">Open actions</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem onClick={() => handleOpenDetails(item)}>
                      <IconEye className="mr-2 size-4 text-muted-foreground" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setAttendeesEvent(item)
                        setIsAttendeesModalOpen(true)
                      }}
                    >
                      <IconTicket className="mr-2 size-4 text-blue-500" />
                      View Attendees ({item.reservations?.length || 0})
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenEdit(item)}>
                      <IconEdit className="mr-2 size-4 text-muted-foreground" />
                      Edit Event
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => handleQuickDelete(item)}
                    >
                      <IconTrash className="mr-2 size-4" />
                      Delete Event
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          },
        }),
      ]),
    [handleOpenDetails, handleOpenEdit, handleQuickDelete, now]
  )

  const table = useTable({
    features,
    data: filteredData,
    columns,
    state: {
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
  })

  // Selected Row IDs for bulk operations
  const selectedRowIds = React.useMemo(() => {
    return Object.keys(rowSelection)
      .map((idx) => filteredData[Number(idx)]?.id)
      .filter((id): id is string => typeof id === "string")
  }, [rowSelection, filteredData])

  const handleBulkDelete = () => {
    if (!selectedRowIds.length) return
    setBulkDeleteDialogOpen(true)
  }

  const confirmBulkDelete = async () => {
    if (!selectedRowIds.length) return
    try {
      setIsBulkActionLoading(true)
      const res = await bulkDeleteEventsAction(selectedRowIds)
      if (res.success) {
        setData((prev) => prev.filter((e) => !selectedRowIds.includes(e.id)))
        setRowSelection({})
        setBulkDeleteDialogOpen(false)
        toast.success(`Deleted ${selectedRowIds.length} events`)
      } else {
        toast.error(res.error || "Bulk delete failed")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsBulkActionLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Tabs Filter Bar */}
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full sm:w-auto"
          >
            <TabsList className="**:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1">
              <TabsTrigger value="all">
                All <Badge variant="secondary">{data.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming
                {upcomingCount > 0 ? (
                  <Badge className="bg-emerald-600 text-white">
                    {upcomingCount}
                  </Badge>
                ) : (
                  <Badge variant="secondary">0</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="past">
                Past <Badge variant="secondary">{pastCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="reservations">
                With Bookings{" "}
                <Badge variant="secondary">{reservationsCount}</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <IconSearch className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search events, venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 pr-8 text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <IconX className="size-3.5" />
                </button>
              )}
            </div>

            {/* Column Visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 text-xs"
                  />
                }
              >
                <IconColumns className="size-3.5" />
                <span className="hidden sm:inline">Columns</span>
                <IconChevronDown className="size-3 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-xs"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* New Event Button */}
            <Button
              size="sm"
              onClick={() => {
                setEditingEvent(null)
                setIsFormModalOpen(true)
              }}
              className="h-9 gap-1.5 text-xs shadow-xs"
            >
              <IconPlus className="size-4" />
              <span>Create Event</span>
            </Button>
          </div>
        </div>

        {/* Floating Bulk Actions Bar when rows are selected */}
        {selectedRowIds.length > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 transition animate-in fade-in">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>{selectedRowIds.length} events selected</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isBulkActionLoading}
                className="h-8 gap-1"
              >
                {isBulkActionLoading ? (
                  <IconLoader className="size-3.5 animate-spin" />
                ) : (
                  <IconTrash className="size-3.5" />
                )}
                Delete Selected
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <FlexRender header={header} />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        <FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-36 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <IconCalendarEvent className="size-8 text-muted-foreground/40" />
                      <p className="text-sm font-medium">No events found</p>
                      <p className="text-xs text-muted-foreground">
                        {searchQuery
                          ? "Try adjusting your search criteria"
                          : "Schedule a church event to get started"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-1 text-sm text-muted-foreground">
          <div className="text-xs">
            Showing{" "}
            <span className="font-medium text-foreground">
              {table.getRowModel().rows.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {filteredData.length}
            </span>{" "}
            events
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <Label htmlFor="events-page-size" className="text-xs">
                Rows per page:
              </Label>
              <Select
                value={String(pagination.pageSize)}
                onValueChange={(val) => {
                  setPagination((prev) => ({
                    ...prev,
                    pageSize: Number(val),
                    pageIndex: 0,
                  }))
                }}
              >
                <SelectTrigger
                  id="events-page-size"
                  className="h-8 w-16 text-xs"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <IconChevronsLeft className="size-4" />
                <span className="sr-only">First page</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <IconChevronLeft className="size-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              <span className="px-2 text-xs font-medium text-foreground">
                Page {table.state.pagination.pageIndex + 1} of{" "}
                {Math.max(1, table.getPageCount())}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <IconChevronRight className="size-4" />
                <span className="sr-only">Next page</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <IconChevronsRight className="size-4" />
                <span className="sr-only">Last page</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Drawer */}
      <EventDrawer
        event={selectedEvent}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onEdit={(ev) => {
          setIsDrawerOpen(false)
          setEditingEvent(ev)
          setIsFormModalOpen(true)
        }}
        onUpdate={() => {
          if (selectedEvent) {
            setData((prev) => prev.filter((e) => e.id !== selectedEvent.id))
          }
        }}
      />

      {/* Create / Edit Event Drawer */}
      <EventFormDialog
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        event={editingEvent}
        onSuccess={() => {
          // Revalidation triggers fresh data from server
        }}
      />

      {/* Single Delete Confirmation Dialog */}
      <AlertDialog
        open={!!eventToDelete}
        onOpenChange={(open) => !open && setEventToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the event &ldquo;
              <span className="font-semibold text-foreground">
                {eventToDelete?.theme}
              </span>
              &rdquo;? This will permanently delete the event along with all
              associated flyers, reservations, and minister connections.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingSingle}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeletingSingle}
              onClick={confirmSingleDelete}
            >
              {isDeletingSingle ? "Deleting..." : "Delete Event"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Events</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-foreground">
                {selectedRowIds.length}
              </span>{" "}
              selected {selectedRowIds.length === 1 ? "event" : "events"}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkActionLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isBulkActionLoading}
              onClick={confirmBulkDelete}
            >
              {isBulkActionLoading ? "Deleting..." : "Delete Selected"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Event Attendees Roster Dialog */}
      <EventAttendeesDialog
        event={attendeesEvent}
        open={isAttendeesModalOpen}
        onOpenChange={setIsAttendeesModalOpen}
      />
    </div>
  )
}
