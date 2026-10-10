import { and, db, eq, testimonial, testimonial_image } from "@repo/database";
import { NextResponse } from "next/server";
import { getPresignedUrl } from "@/lib/r2";

const imageKeyPattern = /^testimonials\/\d+\/[0-9a-f-]+\.(jpg|png|webp)$/i;

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  if (!key || !imageKeyPattern.test(key)) {
    return NextResponse.json({ error: "Invalid image key." }, { status: 400 });
  }

  try {
    const [image] = await db
      .select({ key: testimonial_image.image })
      .from(testimonial_image)
      .innerJoin(
        testimonial,
        eq(testimonial_image.testimonial_id, testimonial.id),
      )
      .where(
        and(
          eq(testimonial_image.image, key),
          eq(testimonial.is_verified, true),
        ),
      )
      .limit(1);

    if (!image) {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }

    return NextResponse.redirect(await getPresignedUrl(key), {
      headers: { "Cache-Control": "private, max-age=300" },
    });
  } catch (error) {
    console.error("Failed to create testimonial image URL:", error);
    return NextResponse.json(
      { error: "Unable to load image." },
      { status: 500 },
    );
  }
}
