"use client";

import * as React from "react";
import { Button } from "@repo/ui/components/button";
import {
  IconCheck,
  IconLoader,
  IconPhoto,
  IconTrash,
  IconUpload,
  IconZoomIn,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { cn, getEventImageUrl } from "@/lib/utils";

interface ImageUploadFieldProps {
  label: string;
  description?: string;
  value?: string; // S3 key or URL
  onChange: (key: string) => void;
  folder?: string;
  aspectRatio?: "video" | "square" | "portrait";
}

export function ImageUploadField({
  label,
  description,
  value,
  onChange,
  folder = "events",
  aspectRatio = "video",
}: ImageUploadFieldProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [previewSrc, setPreviewSrc] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  // Sync external value
  React.useEffect(() => {
    if (value) {
      setPreviewSrc(getEventImageUrl(value));
    } else {
      setPreviewSrc(null);
    }
  }, [value]);

  const handleUploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPEG, PNG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file must be under 10 MB.");
      return;
    }

    // Local temporary preview
    const localUrl = URL.createObjectURL(file);
    setPreviewSrc(localUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", folder);

      const res = await fetch("/api/s3/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success && data.key) {
        onChange(data.key);
        setPreviewSrc(data.url || localUrl);
        toast.success(`${file.name} uploaded successfully!`);
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image",
      );
      // Reset if upload failed
      if (!value) {
        setPreviewSrc(null);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
    // reset input so the same file can be selected again
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setPreviewSrc(null);
    toast.info("Image removed");
  };

  const aspectClass =
    aspectRatio === "video"
      ? "aspect-video"
      : aspectRatio === "portrait"
        ? "aspect-[3/4]"
        : "aspect-square";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-foreground">{label}</label>
        {value && !uploading && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <IconCheck className="size-3" />
            Uploaded
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {previewSrc ? (
        // Preview State with image and controls
        <div
          className={cn(
            "group relative flex w-full items-center justify-center overflow-hidden rounded-xl border bg-muted/30 shadow-xs transition hover:border-primary/50",
            aspectClass,
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt={label}
            className={cn(
              "size-full object-cover transition duration-300",
              uploading && "opacity-50 blur-xs",
            )}
          />

          {/* Uploading Overlay */}
          {uploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 text-white backdrop-blur-xs">
              <IconLoader className="size-6 animate-spin text-primary" />
              <span className="text-xs font-medium">Uploading to Cloud...</span>
            </div>
          )}

          {/* Action Overlay */}
          {!uploading && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 backdrop-blur-[2px] transition group-hover:opacity-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 gap-1 text-xs shadow-md bg-white/90 text-foreground hover:bg-white"
              >
                <IconUpload className="size-3.5" />
                Replace
              </Button>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                className="h-8 gap-1 text-xs shadow-md"
              >
                <IconTrash className="size-3.5" />
                Remove
              </Button>
            </div>
          )}
        </div>
      ) : (
        // Empty State Dropzone
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition hover:border-primary/60 hover:bg-muted/40",
            isDragging
              ? "border-primary bg-primary/10"
              : "border-border/70 bg-muted/20",
            uploading && "pointer-events-none opacity-50",
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-1.5 py-2">
              <IconLoader className="size-6 animate-spin text-primary" />
              <span className="text-xs font-medium text-foreground">
                Uploading...
              </span>
            </div>
          ) : (
            <>
              <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-2xs group-hover:text-primary">
                <IconPhoto className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-medium text-foreground">
                  <span className="text-primary underline underline-offset-2">
                    Click to browse
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {description || "PNG, JPG, WebP up to 10 MB"}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
