import { NextResponse } from "next/server"
import { uploadToR2 } from "@/lib/r2"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const folder = (formData.get("folder") as string) || "events"

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file was provided in form data." },
        { status: 400 }
      )
    }

    const extension = ALLOWED_TYPES[file.type]
    if (!extension) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, and GIF images are supported." },
        { status: 415 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image size must not exceed 10 MB." },
        { status: 413 }
      )
    }

    const bytes = new Uint8Array(await file.arrayBuffer())

    // Unique key generator
    const cleanName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 30)
    const key = `${folder}/${Date.now()}-${cleanName}-${Math.random().toString(36).slice(2, 7)}.${extension}`

    await uploadToR2(bytes, key, file.type)

    return NextResponse.json({
      success: true,
      key,
      url: `/api/s3/download?key=${encodeURIComponent(key)}`,
      name: file.name,
      size: file.size,
    })
  } catch (error) {
    console.error("Image upload failed:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload image." },
      { status: 500 }
    )
  }
}
