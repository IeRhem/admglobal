export { cn } from "cn"

export function getTestimonyImageUrl(imagePath?: string | null): string {
  if (!imagePath) return ""
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath
  }
  if (imagePath.startsWith("testimonials/")) {
    return `/api/s3/download?key=${encodeURIComponent(imagePath)}`
  }
  if (imagePath.startsWith("/")) {
    return imagePath
  }
  return `/api/s3/download?key=${encodeURIComponent(imagePath)}`
}

export function getEventImageUrl(imagePath?: string | null): string {
  if (!imagePath) return ""
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath
  }
  if (imagePath.startsWith("/")) {
    return imagePath
  }
  return `/api/s3/download?key=${encodeURIComponent(imagePath)}`
}

export function formatEventTime(timeVal?: string | Date | null): string {
  if (!timeVal) return ""
  if (typeof timeVal === "string") {
    // If it's already HH:mm or HH:mm:ss, parse nicely
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeVal)) {
      const parts = timeVal.split(":")
      const hour = parseInt(parts[0] ?? "0", 10)
      const minute = parts[1] ?? "00"
      const ampm = hour >= 12 ? "PM" : "AM"
      const formattedHour = hour % 12 || 12
      return `${formattedHour}:${minute} ${ampm}`
    }
  }
  try {
    const d = new Date(timeVal)
    if (isNaN(d.getTime())) return String(timeVal)
    return new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
    }).format(d)
  } catch {
    return String(timeVal)
  }
}

export function formatEventDateRange(
  startVal: string | Date,
  endVal: string | Date
): string {
  try {
    const start = new Date(startVal)
    const end = new Date(endVal)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return ""

    const sameDay =
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      start.getDate() === end.getDate()

    const startFmt = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(start)

    if (sameDay) {
      return startFmt
    }

    const endFmt = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(end)

    return `${startFmt} – ${endFmt}`
  } catch {
    return ""
  }
}

export function getBadgePhotoUrl(photoPath?: string | null): string {
  if (!photoPath) return ""
  if (
    photoPath.startsWith("http://") ||
    photoPath.startsWith("https://") ||
    photoPath.startsWith("data:")
  ) {
    return photoPath
  }
  if (photoPath.startsWith("/")) {
    return photoPath
  }
  return `/api/s3/download?key=${encodeURIComponent(photoPath)}`
}

export function formatDateTime(dateVal?: string | Date | null): string {
  if (!dateVal) return ""
  try {
    const d = new Date(dateVal)
    if (isNaN(d.getTime())) return String(dateVal)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(d)
  } catch {
    return String(dateVal)
  }
}

export function csvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '""'
  }
  let str = String(value)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`
  }
  return `"${str.replace(/"/g, '""')}"`
}
