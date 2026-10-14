import { db, eq, testimonial_image } from "@repo/database"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getPresignedUrl } from "@/lib/r2"

const imageKeyPattern = /^testimonials\/[0-9a-f-]+\/[0-9a-f-]+\.(jpg|png|webp)$/i

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const role = (session.user as { role?: string }).role
  if (role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: Admin access required." },
      { status: 403 }
    )
  }

  const key = new URL(request.url).searchParams.get("key")
  if (!key || !imageKeyPattern.test(key)) {
    return NextResponse.json({ error: "Invalid or missing image key." }, { status: 400 })
  }

  try {
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
  } catch (error) {
    console.error("Failed to create testimonial image URL:", error)
    return NextResponse.json(
      { error: "Unable to load image." },
      { status: 500 }
    )
  }
}
