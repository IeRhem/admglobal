"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/components/drawer";
import { Separator } from "@repo/ui/components/separator";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@repo/ui/components/alert";
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
import {
  IconAlertCircle,
  IconCheck,
  IconCircleCheck,
  IconClock,
  IconCopy,
  IconExternalLink,
  IconMail,
  IconPhoto,
  IconTrash,
  IconX,
  IconZoomIn,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  deleteTestimonyAction,
  toggleTestimonyVerification,
} from "@/lib/action/testimony";
import { cn, getTestimonyImageUrl } from "@/lib/utils";
import type { AdminTestimonyItem } from "./types";

interface TestimonyDrawerProps {
  testimony: AdminTestimonyItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (action: "toggle" | "delete") => void;
}

function TestimonyImageCard({
  src,
  alt,
  onZoom,
}: {
  src: string;
  alt: string;
  onZoom: (src: string) => void;
}) {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  return (
    <div
      onClick={() => !error && onZoom(src)}
      className="group relative aspect-video overflow-hidden rounded-xl border bg-muted/50 shadow-xs transition hover:ring-2 hover:ring-primary/40 cursor-pointer"
    >
      {/* Loading Skeleton */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/60 animate-pulse">
          <IconPhoto className="size-6 text-muted-foreground/30 animate-pulse" />
        </div>
      )}

      {/* Image */}
      {!error ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setError(true);
            setLoaded(true);
          }}
          className={cn(
            "size-full object-cover transition duration-300 group-hover:scale-105",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-1.5 p-3 text-center text-xs text-muted-foreground bg-muted/30">
          <IconAlertCircle className="size-5 text-amber-500" />
          <span>Image preview unavailable</span>
        </div>
      )}

      {/* Hover Overlay */}
      {!error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[1px] transition duration-200 group-hover:opacity-100">
          <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-md">
            <IconZoomIn className="size-3.5" />
            <span>Click to View</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function TestimonyDrawer({
  testimony,
  open,
  onOpenChange,
  onUpdate,
}: TestimonyDrawerProps) {
  const isMobile = useIsMobile();
  const [loading, setLoading] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);

  if (!testimony) return null;

  const fullName =
    [testimony.firstName, testimony.lastName].filter(Boolean).join(" ") ||
    "Anonymous Member";

  const initials =
    [testimony.firstName?.[0], testimony.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "A";

  const formattedDate = new Date(testimony.createdAt).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const handleToggleVerification = async () => {
    try {
      setLoading(true);
      const nextStatus = !testimony.isVerified;
      const res = await toggleTestimonyVerification(testimony.id, nextStatus);
      if (res.success) {
        toast.success(
          nextStatus
            ? "Testimony approved and published"
            : "Testimony moved back to pending review"
        );
        onUpdate?.("toggle");
        onOpenChange(false);
      } else {
        toast.error(res.error || "Failed to update testimony");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await deleteTestimonyAction(testimony.id);
      if (res.success) {
        toast.success("Testimony deleted successfully");
        setDeleteConfirmOpen(false);
        onUpdate?.("delete");
        onOpenChange(false);
      } else {
        toast.error(res.error || "Failed to delete testimony");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyStory = () => {
    navigator.clipboard.writeText(testimony.message);
    toast.success("Testimony message copied to clipboard");
  };

  const handleCopyEmail = () => {
    if (testimony.email) {
      navigator.clipboard.writeText(testimony.email);
      toast.success("Email copied to clipboard");
    }
  };

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
                <Avatar size="lg">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <DrawerTitle className="text-xl font-semibold">
                    {fullName}
                  </DrawerTitle>
                  <DrawerDescription className="text-xs">
                    Submitted {formattedDate}
                  </DrawerDescription>
                </div>
              </div>
              <div>
                {testimony.isVerified ? (
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
                    Pending Review
                  </Badge>
                )}
              </div>
            </div>
          </DrawerHeader>

          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-4 text-sm sm:px-6">
            {!testimony.isVerified && (
              <Alert variant="warning">
                <IconAlertCircle className="size-4" />
                <AlertTitle>Pending Moderation</AlertTitle>
                <AlertDescription>
                  This testimony is unverified and hidden from the public website. Review the contents and approve to publish.
                </AlertDescription>
              </Alert>
            )}

            {/* Author Details Card */}
            <div className="rounded-lg border bg-muted/30 p-3 sm:p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Contact Information
              </h3>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <IconMail className="size-4 text-muted-foreground" />
                  <span className="font-medium">
                    {testimony.email || "No email provided"}
                  </span>
                </div>
                {testimony.email && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyEmail}
                    className="h-7 text-xs"
                  >
                    <IconCopy className="mr-1 size-3" />
                    Copy
                  </Button>
                )}
              </div>
            </div>

            {/* Testimony Narrative */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Testimony Message
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyStory}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  <IconCopy className="mr-1 size-3" />
                  Copy Story
                </Button>
              </div>
              <div className="rounded-xl border bg-card p-4 shadow-xs">
                <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                  {testimony.message}
                </p>
              </div>
            </div>

            {/* Images Section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconPhoto className="size-4 text-muted-foreground" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Attached Media ({testimony.images?.length || 0})
                  </h3>
                </div>
                {testimony.images && testimony.images.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Click photo to zoom
                  </span>
                )}
              </div>

              {testimony.images && testimony.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {testimony.images.map((img, idx) => {
                    const resolvedSrc = getTestimonyImageUrl(img.image);
                    return (
                      <TestimonyImageCard
                        key={img.id || idx}
                        src={resolvedSrc}
                        alt={`Attachment ${idx + 1}`}
                        onZoom={(src) => setPreviewImage(src)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground">
                  No images attached to this testimony
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
              Delete
            </Button>

            <div className="flex items-center gap-2">
              <DrawerClose render={<Button variant="outline" size="sm" />}>
                Close
              </DrawerClose>

              <Button
                size="sm"
                variant={testimony.isVerified ? "outline" : "default"}
                onClick={handleToggleVerification}
                disabled={loading}
                className={
                  !testimony.isVerified
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : ""
                }
              >
                {testimony.isVerified ? (
                  <>
                    <IconX className="mr-1.5 size-4" />
                    Move to Pending
                  </>
                ) : (
                  <>
                    <IconCheck className="mr-1.5 size-4" />
                    Approve Testimony
                  </>
                )}
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Lightbox Modal for Full-Size Image Preview */}
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
                  Attached Photo Preview
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
                alt="Full preview"
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
            <AlertDialogTitle>Delete Testimony</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this testimony by{" "}
              <span className="font-semibold text-foreground">{fullName}</span>?
              This action cannot be undone and will permanently remove all attached images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={loading}
              onClick={handleDelete}
            >
              {loading ? "Deleting..." : "Delete Testimony"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
