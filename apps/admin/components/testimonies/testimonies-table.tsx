"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
} from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/alert-dialog";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import {
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheck,
  IconClock,
  IconColumns,
  IconCopy,
  IconDotsVertical,
  IconEye,
  IconLoader,
  IconPhoto,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  bulkDeleteTestimoniesAction,
  bulkUpdateVerificationAction,
  deleteTestimonyAction,
  toggleTestimonyVerification,
} from "@/lib/action/testimony";
import { getTestimonyImageUrl } from "@/lib/utils";
import { NewTestimonyDialog } from "./new-testimony-dialog";
import { TestimonyDrawer } from "./testimony-drawer";
import type { AdminTestimonyItem } from "./types";

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
});

const columnHelper = createColumnHelper<typeof features, AdminTestimonyItem>();

interface TestimoniesTableProps {
  initialData: AdminTestimonyItem[];
}

export function TestimoniesTable({ initialData }: TestimoniesTableProps) {
  const router = useRouter();
  const [data, setData] = React.useState<AdminTestimonyItem[]>(initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTestimony, setSelectedTestimony] =
    React.useState<AdminTestimonyItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isBulkActionLoading, setIsBulkActionLoading] = React.useState(false);
  const [testimonyToDelete, setTestimonyToDelete] =
    React.useState<AdminTestimonyItem | null>(null);
  const [isDeletingSingle, setIsDeletingSingle] = React.useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = React.useState(false);

  // Sync initialData updates if any
  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Filter dataset by activeTab and searchQuery
  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      // Tab filter
      if (activeTab === "pending" && item.isVerified) return false;
      if (activeTab === "approved" && !item.isVerified) return false;
      if (activeTab === "photos" && (!item.images || item.images.length === 0))
        return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const name =
        `${item.firstName || ""} ${item.lastName || ""}`.toLowerCase();
      const email = (item.email || "").toLowerCase();
      const message = item.message.toLowerCase();

      return (
        name.includes(query) || email.includes(query) || message.includes(query)
      );
    });
  }, [data, activeTab, searchQuery]);

  const pendingCount = React.useMemo(
    () => data.filter((t) => !t.isVerified).length,
    [data],
  );
  const approvedCount = React.useMemo(
    () => data.filter((t) => t.isVerified).length,
    [data],
  );
  const photosCount = React.useMemo(
    () => data.filter((t) => t.images && t.images.length > 0).length,
    [data],
  );

  const handleOpenDetails = React.useCallback((item: AdminTestimonyItem) => {
    setSelectedTestimony(item);
    setIsDrawerOpen(true);
  }, []);

  const handleQuickToggle = React.useCallback(
    async (item: AdminTestimonyItem) => {
      const nextStatus = !item.isVerified;
      const res = await toggleTestimonyVerification(item.id, nextStatus);
      if (res.success) {
        setData((prev) =>
          prev.map((t) =>
            t.id === item.id ? { ...t, isVerified: nextStatus } : t,
          ),
        );
        toast.success(
          nextStatus ? "Testimony approved" : "Testimony marked as pending",
        );
      } else {
        toast.error(res.error || "Action failed");
      }
    },
    [],
  );

  const handleQuickDelete = React.useCallback(
    (item: AdminTestimonyItem) => {
      setTestimonyToDelete(item);
    },
    [],
  );

  const confirmSingleDelete = async () => {
    if (!testimonyToDelete) return;
    try {
      setIsDeletingSingle(true);
      const res = await deleteTestimonyAction(testimonyToDelete.id);
      if (res.success) {
        setData((prev) => prev.filter((t) => t.id !== testimonyToDelete.id));
        toast.success("Testimony deleted");
        setTestimonyToDelete(null);
      } else {
        toast.error(res.error || "Delete failed");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeletingSingle(false);
    }
  };

  const columns = React.useMemo(
    () =>
      columnHelper.columns([
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
                onCheckedChange={(value) =>
                  table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
              />
            </div>
          ),
          cell: ({ row }) => (
            <div className="flex items-center justify-center">
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
              />
            </div>
          ),
          enableSorting: false,
          enableHiding: false,
        }),

        columnHelper.accessor("firstName", {
          id: "author",
          header: "Author",
          cell: ({ row }) => {
            const item = row.original;
            const fullName =
              [item.firstName, item.lastName].filter(Boolean).join(" ") ||
              "Anonymous Member";
            const initials =
              [item.firstName?.[0], item.lastName?.[0]]
                .filter(Boolean)
                .join("")
                .toUpperCase() || "A";

            return (
              <div
                className="flex cursor-pointer items-center gap-3 py-1"
                onClick={() => handleOpenDetails(item)}
              >
                <Avatar size="default">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground hover:underline">
                    {fullName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.email || "No email"}
                  </span>
                </div>
              </div>
            );
          },
        }),

        columnHelper.accessor("message", {
          header: "Testimony",
          cell: ({ row }) => {
            const item = row.original;
            return (
              <div
                className="max-w-md cursor-pointer hover:text-foreground"
                onClick={() => handleOpenDetails(item)}
              >
                <p className="line-clamp-2 text-sm text-muted-foreground hover:text-foreground">
                  {item.message}
                </p>
              </div>
            );
          },
        }),

        columnHelper.display({
          id: "photos",
          header: "Photos",
          cell: ({ row }) => {
            const images = row.original.images || [];
            if (images.length === 0) {
              return (
                <span className="text-xs text-muted-foreground/60">—</span>
              );
            }

            const firstImageUrl = getTestimonyImageUrl(images[0]?.image);

            return (
              <div
                className="flex cursor-pointer items-center gap-1.5 hover:opacity-90 transition"
                onClick={() => handleOpenDetails(row.original)}
                title="View attached photos"
              >
                <div className="relative size-8 shrink-0 overflow-hidden rounded-md border bg-muted shadow-2xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={firstImageUrl}
                    alt="Testimony thumbnail"
                    className="size-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center -z-10">
                    <IconPhoto className="size-3.5 text-muted-foreground" />
                  </div>
                </div>
                {images.length > 1 && (
                  <Badge
                    variant="secondary"
                    className="h-5 px-1.5 text-[10px] font-semibold"
                  >
                    +{images.length - 1}
                  </Badge>
                )}
              </div>
            );
          },
        }),

        columnHelper.display({
          id: "status",
          header: "Status",
          cell: ({ row }) => {
            const isVerified = row.original.isVerified;
            return isVerified ? (
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              >
                <IconCircleCheck className="size-3.5 fill-emerald-500 text-white dark:text-card" />
                Approved
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
              >
                <IconClock className="size-3.5" />
                Pending
              </Badge>
            );
          },
        }),

        columnHelper.display({
          id: "createdAt",
          header: "Date",
          cell: ({ row }) => {
            const date = new Date(row.original.createdAt);
            return (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {date.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            );
          },
        }),

        columnHelper.display({
          id: "actions",
          cell: ({ row }) => {
            const item = row.original;
            return (
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
                  <span className="sr-only">Open menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => handleOpenDetails(item)}>
                    <IconEye className="mr-2 size-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleQuickToggle(item)}>
                    {item.isVerified ? (
                      <>
                        <IconX className="mr-2 size-4 text-amber-500" />
                        Mark as Pending
                      </>
                    ) : (
                      <>
                        <IconCheck className="mr-2 size-4 text-emerald-500" />
                        Approve Testimony
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(item.message);
                      toast.success("Story copied to clipboard");
                    }}
                  >
                    <IconCopy className="mr-2 size-4" />
                    Copy Message
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => handleQuickDelete(item)}
                  >
                    <IconTrash className="mr-2 size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          },
        }),
      ]),
    [handleOpenDetails, handleQuickToggle, handleQuickDelete],
  );

  const table = useTable({
    features,
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
  });

  const selectedRowIds = Object.keys(rowSelection).filter(
    (id) => (rowSelection as Record<string, boolean>)[id],
  );

  const handleBulkApprove = async () => {
    if (!selectedRowIds.length) return;
    try {
      setIsBulkActionLoading(true);
      const res = await bulkUpdateVerificationAction(selectedRowIds, true);
      if (res.success) {
        setData((prev) =>
          prev.map((t) =>
            selectedRowIds.includes(t.id) ? { ...t, isVerified: true } : t,
          ),
        );
        setRowSelection({});
        toast.success(`Approved ${selectedRowIds.length} testimonies`);
      } else {
        toast.error(res.error || "Bulk action failed");
      }
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkPending = async () => {
    if (!selectedRowIds.length) return;
    try {
      setIsBulkActionLoading(true);
      const res = await bulkUpdateVerificationAction(selectedRowIds, false);
      if (res.success) {
        setData((prev) =>
          prev.map((t) =>
            selectedRowIds.includes(t.id) ? { ...t, isVerified: false } : t,
          ),
        );
        setRowSelection({});
        toast.success(`Moved ${selectedRowIds.length} testimonies to pending`);
      } else {
        toast.error(res.error || "Bulk action failed");
      }
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkDelete = () => {
    if (!selectedRowIds.length) return;
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    if (!selectedRowIds.length) return;
    try {
      setIsBulkActionLoading(true);
      const res = await bulkDeleteTestimoniesAction(selectedRowIds);
      if (res.success) {
        setData((prev) => prev.filter((t) => !selectedRowIds.includes(t.id)));
        setRowSelection({});
        setBulkDeleteDialogOpen(false);
        toast.success(`Deleted ${selectedRowIds.length} testimonies`);
      } else {
        toast.error(res.error || "Bulk delete failed");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsBulkActionLoading(false);
    }
  };

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
              <TabsTrigger value="pending">
                Pending Review
                {pendingCount > 0 ? (
                  <Badge className="bg-amber-500 text-white dark:bg-amber-600">
                    {pendingCount}
                  </Badge>
                ) : (
                  <Badge variant="secondary">0</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved <Badge variant="secondary">{approvedCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="photos">
                With Photos <Badge variant="secondary">{photosCount}</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <IconSearch className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search author or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-sm"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="outline" size="sm" />}
              >
                <IconColumns data-icon="inline-start" />
                Columns
                <IconChevronDown data-icon="inline-end" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide(),
                  )
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
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

            <Button
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="gap-1.5"
            >
              <IconPlus className="size-4" />
              <span>Add Testimony</span>
            </Button>
          </div>
        </div>

        {/* Floating Bulk Actions Bar when rows are selected */}
        {selectedRowIds.length > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 transition">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>{selectedRowIds.length} testimonies selected</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkApprove}
                disabled={isBulkActionLoading}
                className="h-8 gap-1 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
              >
                {isBulkActionLoading ? (
                  <IconLoader className="size-3.5 animate-spin" />
                ) : (
                  <IconCheck className="size-3.5" />
                )}
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkPending}
                disabled={isBulkActionLoading}
                className="h-8 gap-1 text-muted-foreground hover:bg-muted"
              >
                <IconClock className="size-3.5" />
                Set Pending
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isBulkActionLoading}
                className="h-8 gap-1"
              >
                <IconTrash className="size-3.5" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted/60">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <FlexRender header={header} />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-10">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="transition-colors hover:bg-muted/40"
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
                    className="h-32 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-1.5 py-4">
                      <p className="font-medium">No testimonies found</p>
                      <p className="text-xs text-muted-foreground">
                        {searchQuery
                          ? "Try adjusting your search criteria"
                          : "New testimonies submitted through the website will appear here"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between px-2">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-6 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-xs font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.state.pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
                items={[10, 20, 30, 50].map((size) => ({
                  label: `${size}`,
                  value: `${size}`,
                }))}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.state.pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  <SelectGroup>
                    {[10, 20, 30, 50].map((size) => (
                      <SelectItem key={size} value={`${size}`}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex w-fit items-center justify-center text-xs font-medium text-muted-foreground">
              Page {table.state.pagination.pageIndex + 1} of{" "}
              {Math.max(1, table.getPageCount())}
            </div>

            <div className="ml-auto flex items-center gap-1 lg:ml-0">
              <Button
                variant="outline"
                className="hidden size-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Drawer */}
      <TestimonyDrawer
        testimony={selectedTestimony}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onUpdate={(action) => {
          if (!selectedTestimony) return;
          if (action === "delete") {
            setData((prev) => prev.filter((t) => t.id !== selectedTestimony.id));
          } else if (action === "toggle") {
            setData((prev) =>
              prev.map((t) =>
                t.id === selectedTestimony.id
                  ? { ...t, isVerified: !selectedTestimony.isVerified }
                  : t,
              ),
            );
          }
        }}
      />

      {/* Add Testimony Dialog */}
      <NewTestimonyDialog
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={() => {
          router.refresh();
        }}
      />

      {/* Single Delete Confirmation Dialog */}
      <AlertDialog
        open={!!testimonyToDelete}
        onOpenChange={(open) => !open && setTestimonyToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimony</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete the testimony by{" "}
              <span className="font-semibold text-foreground">
                {[testimonyToDelete?.firstName, testimonyToDelete?.lastName]
                  .filter(Boolean)
                  .join(" ") || "this person"}
              </span>
              ? This action cannot be undone.
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
              {isDeletingSingle ? "Deleting..." : "Delete"}
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
            <AlertDialogTitle>Delete Selected Testimonies</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-foreground">
                {selectedRowIds.length}
              </span>{" "}
              selected {selectedRowIds.length === 1 ? "testimony" : "testimonies"}?
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
    </div>
  );
}
