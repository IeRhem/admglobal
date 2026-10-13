import { db, eq, testimonial_image } from "@repo/database"
import { NextResponse } from "next/server"
import { getPresignedUrl } from "@/lib/r2"

const imageKeyPattern = /^testimonials\/\d+\/[0-9a-f-]+\.(jpg|png|webp)$/i

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key")
  if (!key) {
    return NextResponse.json({ error: "Missing image key." }, { status: 400 })
  }

  try {
    // If it's a valid R2 key pattern, verify or presign directly
    if (imageKeyPattern.test(key)) {
      const [image] = await db
        .select({ key: testimonial_image.image })
        .from(testimonial_image)
        .where(eq(testimonial_image.image, key))
        .limit(1)

      if (!image) {
        return NextResponse.json({ error: "Image not found." }, { status: 404 })
      }

      const presignedUrl = await getPresignedUrl(key)
      return NextResponse.redirect(presignedUrl, {
        headers: { "Cache-Control": "private, max-age=3600" },
      })
    }

    // Direct fallback for key
    const presignedUrl = await getPresignedUrl(key)
    return NextResponse.redirect(presignedUrl, {
      headers: { "Cache-Control": "private, max-age=3600" },
    })
  } catch (error) {
    console.error("Failed to create testimonial image URL:", error)
    return NextResponse.json(
      { error: "Unable to load image." },
      { status: 500 }
    )
  }
}
