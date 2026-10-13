"use client";

import * as React from "react";
import {
  IconCamera,
  IconDownload,
  IconShare,
  IconCheck,
  IconSparkles,
  IconX,
} from "@tabler/icons-react";
import { toast } from "@repo/ui/components/toast";
import { Button } from "@repo/ui/components/button";

interface AttendeeBadgeGeneratorProps {
  initialName?: string;
  eventTitle: string;
  eventDate?: string;
  eventLocation?: string;
  badgeTemplateImage?: string | null;
  eventImage?: string | null;
  attendanceMode?: "in-person" | "online";
  onClose?: () => void;
}

export function AttendeeBadgeGenerator({
  initialName = "",
  eventTitle,
  eventDate = "",
  eventLocation = "",
  badgeTemplateImage,
  eventImage,
  attendanceMode = "in-person",
  onClose,
}: AttendeeBadgeGeneratorProps) {
  const [name, setName] = React.useState(initialName || "Guest Attendee");
  const [userPhoto, setUserPhoto] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);

  // Sync external name changes if initialName updates
  React.useEffect(() => {
    if (initialName && initialName.trim()) {
      setName(initialName.trim());
    }
  }, [initialName]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.add({
        title: "Invalid file",
        description: "Please select an image file (JPG, PNG, WebP).",
        type: "error",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setUserPhoto(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const getBadgeBackgroundSrc = (): string | null => {
    if (badgeTemplateImage) return badgeTemplateImage;
    if (eventImage && !eventImage.includes("/grid-image/")) return eventImage;
    return null;
  };

  const getPrimaryColor = (): string => {
    if (typeof window !== "undefined") {
      const temp = document.createElement("span");
      temp.className = "text-primary";
      temp.style.display = "none";
      document.body.appendChild(temp);
      const color = window.getComputedStyle(temp).color;
      document.body.removeChild(temp);
      if (color) return color;
    }
    return "#2563eb";
  };

  const renderBadgeToCanvas = async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not create canvas 2D context");

    const bgSrc = getBadgeBackgroundSrc();
    const primaryColor = getPrimaryColor();

    // 1. Draw Background
    if (bgSrc) {
      try {
        const proxyUrl = `/api/badge-image?url=${encodeURIComponent(bgSrc)}`;
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          bgImg.onload = () => resolve();
          bgImg.onerror = () => reject();
          bgImg.src = proxyUrl;
        });
        ctx.drawImage(bgImg, 0, 0, 1080, 1080);
      } catch (err) {
        console.warn(
          "Failed to load badge background via proxy, falling back to procedural design:",
          err,
        );
        drawProceduralBackground(ctx, primaryColor);
      }
    } else {
      drawProceduralBackground(ctx, primaryColor);
    }

    // 2. Draw circular photo in center
    const circleX = 540;
    const circleY = 460;
    const radius = 200;

    if (userPhoto) {
      const photoImg = new Image();
      await new Promise<void>((resolve, reject) => {
        photoImg.onload = () => resolve();
        photoImg.onerror = () => reject();
        photoImg.src = userPhoto;
      });

      ctx.save();
      ctx.beginPath();
      ctx.arc(circleX, circleY, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Cover crop user photo
      const imgWidth = photoImg.width;
      const imgHeight = photoImg.height;
      const scale = Math.max((radius * 2) / imgWidth, (radius * 2) / imgHeight);
      const scaledW = imgWidth * scale;
      const scaledH = imgHeight * scale;
      const offsetX = circleX - scaledW / 2;
      const offsetY = circleY - scaledH / 2;

      ctx.drawImage(photoImg, offsetX, offsetY, scaledW, scaledH);
      ctx.restore();

      // Circle border
      ctx.beginPath();
      ctx.arc(circleX, circleY, radius, 0, Math.PI * 2);
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
    } else {
      // Soft placeholder circle using primary color
      ctx.save();
      ctx.beginPath();
      ctx.arc(circleX, circleY, radius, 0, Math.PI * 2);
      ctx.fillStyle = primaryColor;
      ctx.globalAlpha = 0.35;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.stroke();
      ctx.restore();
    }

    // 3. Draw Name banner (no "will be attending" text)
    const displayName = (name || "ATTENDEE").trim().toUpperCase();

    // Name text metrics
    ctx.font = "bold 44px 'Inter', sans-serif, system-ui";
    ctx.textAlign = "left";
    const nameWidth = ctx.measureText(displayName).width;
    const startX = Math.max(120, circleX - nameWidth / 2 - 20);

    // Accent line in primary color
    ctx.fillStyle = primaryColor;
    ctx.fillRect(startX, 740, 8, 48);

    // Name in primary color
    ctx.fillStyle = primaryColor;
    ctx.fillText(displayName, startX + 22, 778);

    // Dashed underline
    ctx.beginPath();
    ctx.setLineDash([12, 10]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.moveTo(startX, 810);
    ctx.lineTo(startX + nameWidth + 24, 810);
    ctx.stroke();
    ctx.setLineDash([]);

    return canvas;
  };

  const drawProceduralBackground = (
    ctx: CanvasRenderingContext2D,
    primaryColor: string,
  ) => {
    // Elegant dark primary gradient
    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, "#1e1b4b");
    grad.addColorStop(0.5, "#312e81");
    grad.addColorStop(1, "#090d16");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Architectural halftone & silhouettes
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.beginPath();
    ctx.arc(0, 1080, 420, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(1080, 1080, 420, 0, Math.PI * 2);
    ctx.fill();

    // Subtle decorative grid / dots
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    for (let x = 30; x < 1080; x += 40) {
      for (let y = 30; y < 1080; y += 40) {
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Header branding
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.font = "bold 24px 'Inter', sans-serif";
    ctx.fillText("ARROW OF DELIVERANCE", 80, 90);
    ctx.font = "16px 'Inter', sans-serif";
    ctx.fillText("MINISTRIES INTERNATIONAL", 80, 116);

    ctx.textAlign = "right";
    ctx.font = "bold 22px 'Inter', sans-serif";
    ctx.fillText("ANNUAL CONFERENCE", 1000, 90);

    // Left info (Date & Venue)
    if (eventDate) {
      ctx.textAlign = "left";
      ctx.fillStyle = "#facc15";
      ctx.font = "bold 26px 'Inter', sans-serif";
      ctx.fillText(eventDate.toUpperCase(), 80, 420);
    }
    if (eventLocation) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.font = "18px 'Inter', sans-serif";
      ctx.fillText(eventLocation.slice(0, 26).toUpperCase(), 80, 450);
    }
  };

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      const canvas = await renderBadgeToCanvas();
      const dataUrl = canvas.toDataURL("image/png");
      const safeName = (name || "attendee")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");

      const link = document.createElement("a");
      link.download = `admi-badge-${safeName}.png`;
      link.href = dataUrl;
      link.click();

      toast.add({
        title: "Badge downloaded!",
        description: "Your personalized badge was saved to your device.",
        type: "success",
      });
    } catch (error) {
      console.error("Error downloading badge:", error);
      toast.add({
        title: "Download failed",
        description: "Unable to export badge image. Please try again.",
        type: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsGenerating(true);
      const canvas = await renderBadgeToCanvas();

      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.add({
            title: "Error",
            description: "Failed to generate badge for sharing.",
            type: "error",
          });
          setIsGenerating(false);
          return;
        }

        const safeName = (name || "attendee")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-");
        const file = new File([blob], `admi-badge-${safeName}.png`, {
          type: "image/png",
        });
        const shareData = {
          title: `My Badge for ${eventTitle}`,
          text: `I'll be attending ${eventTitle}! Join me here: ${window.location.href}`,
          files: [file],
        };

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share(shareData);
            toast.add({
              title: "Badge Shared!",
              description: "Thank you for sharing your badge.",
              type: "success",
            });
          } catch (shareErr) {
            if ((shareErr as Error)?.name !== "AbortError") {
              console.warn("Share cancelled or failed:", shareErr);
            }
          }
        } else {
          // Fallback: Copy link and trigger download
          const textToCopy = `I will be attending ${eventTitle}! Get your pass here: ${window.location.href}`;
          await navigator.clipboard.writeText(textToCopy);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 3000);

          // Trigger download
          const link = document.createElement("a");
          link.download = `admi-badge-${safeName}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();

          toast.add({
            title: "Badge saved & caption copied!",
            description:
              "Image downloaded to your device and caption copied to clipboard.",
            type: "success",
          });
        }
        setIsGenerating(false);
      }, "image/png");
    } catch (error) {
      console.error("Error sharing badge:", error);
      setIsGenerating(false);
      toast.add({
        title: "Sharing failed",
        description:
          "Unable to share badge. Please use the download button instead.",
        type: "error",
      });
    }
  };

  const bgImageSrc = getBadgeBackgroundSrc();

  return (
    <div className="flex flex-col w-full max-w-md mx-auto text-white rounded-2xl bg-[#121316] p-4 sm:p-6 shadow-2xl border border-neutral-800">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <IconSparkles className="size-5 text-primary" />
          <h2 className="text-base font-semibold tracking-wide text-neutral-100">
            Personalized Attendee Badge
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors p-1 rounded-md"
            aria-label="Close"
          >
            <IconX className="size-5" />
          </button>
        )}
      </div>

      {/* Name on Badge Input */}
      <div className="mb-4">
        <label
          htmlFor="badge-name-input"
          className="block text-xs font-medium text-neutral-400 mb-1.5"
        >
          Name on badge
        </label>
        <input
          id="badge-name-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          maxLength={40}
          className="w-full bg-[#1b1c20] border border-neutral-700/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3.5 py-2.5 text-sm font-medium text-neutral-100 placeholder:text-neutral-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      {/* Badge Visual Canvas Preview Container */}
      <div
        ref={previewRef}
        className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl border border-neutral-800/80 select-none bg-radial from-primary/80 via-primary/30 to-neutral-950 flex flex-col items-center justify-between p-4 sm:p-5"
      >
        {/* Background Image if available */}
        {bgImageSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bgImageSrc}
            alt={eventTitle}
            className="absolute inset-0 size-full object-cover"
          />
        )}

        {/* Decorative Halftone / Architectural Details if procedural */}
        {!bgImageSrc && (
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        )}

        {/* Badge Header Area */}
        <div className="relative z-10 w-full flex items-start justify-between text-[11px] font-bold tracking-wider uppercase text-white/90">
          <div>
            <div className="leading-tight">ARROW OF DELIVERANCE</div>
            <div className="text-[9px] text-white/70">MINISTRIES</div>
          </div>
          <div className="text-right">
            <div className="text-primary font-extrabold">ANNUAL GATHERING</div>
            {eventDate && (
              <div className="text-[9px] text-white/80">{eventDate}</div>
            )}
          </div>
        </div>

        {/* Center Circular Photo Upload Area */}
        <div className="relative z-10 my-auto flex flex-col items-center">
          {/* Tooltip speech bubble pointing down to circular frame */}
          {!userPhoto && (
            <div className="mb-2 animate-bounce flex flex-col items-center">
              <div className="bg-white text-neutral-900 text-[11px] font-semibold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap">
                Tap the badge to upload your photo
              </div>
              <div className="w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-white -mt-0.5" />
            </div>
          )}

          {/* Circular Frame */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group relative size-36 sm:size-44 rounded-full border-4 border-white/80 overflow-hidden shadow-2xl cursor-pointer bg-primary/20 hover:ring-4 hover:ring-primary/50 transition-all duration-300 flex items-center justify-center"
            title="Click to choose a photo"
          >
            {userPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userPhoto}
                alt={name}
                className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="size-full flex items-center justify-center bg-primary/20 text-primary-foreground group-hover:bg-primary/30">
                <IconCamera className="size-10 opacity-80 group-hover:scale-110 transition-transform" />
              </div>
            )}

            {/* Floating Camera Icon at ~4 o'clock */}
            <div
              className="absolute bottom-1 right-1 size-8 sm:size-9 rounded-full bg-primary text-primary-foreground shadow-md flex items-center justify-center border-2 border-white pointer-events-none group-hover:scale-110 transition-transform"
              aria-label="Upload photo"
            >
              <IconCamera className="size-4 sm:size-5" />
            </div>
          </div>
        </div>

        {/* Badge Bottom Section: Name only (no 'will be attending' text) */}
        <div className="relative z-10 w-full flex flex-col items-center text-center mt-auto pb-4">
          {/* Accent + Name in primary color */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-6 bg-primary rounded-full shrink-0" />
            <span className="font-heading font-black text-primary text-xl sm:text-2xl uppercase tracking-wide drop-shadow-md">
              {name || "ATTENDEE"}
            </span>
          </div>

          {/* Dashed underline */}
          <div className="w-3/4 border-b-2 border-dashed border-white/60 mx-auto" />
        </div>
      </div>

      {/* Action Buttons Below Badge */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {/* Download Button */}
        <Button
          type="button"
          onClick={handleDownload}
          disabled={isGenerating}
          size="lg"
        >
          <IconDownload className="size-4 shrink-0" />
          <span>{isGenerating ? "Preparing..." : "Download"}</span>
        </Button>

        {/* Share Button using primary color */}
        <Button
          type="button"
          onClick={handleShare}
          disabled={isGenerating}
          variant="outline"
          size="lg"
        >
          {isCopied ? (
            <>
              <IconCheck className="size-4 shrink-0" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <IconShare className="size-4 shrink-0" />
              <span>Share badge</span>
            </>
          )}
        </Button>
      </div>

      {/* Subtitle helper */}
      <p className="text-[11px] text-neutral-400 text-center mt-3 leading-relaxed">
        Share the badge image and caption to a compatible app on your device.
      </p>
    </div>
  );
}
