import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { db, eq, testimonial_image } from "@repo/database";
import { NextResponse } from "next/server";
import { S3 } from "@/lib/S3Client";

export async function DELETE(request: Request) {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) {
    return NextResponse.json(
      { error: "R2_BUCKET_NAME is required to delete images." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const key =
    typeof body === "object" && body !== null && "key" in body
      ? body.key
      : undefined;
  if (
    typeof key !== "string" ||
    !/^testimonials\/\d+\/[0-9a-f-]+\.(jpg|png|webp)$/i.test(key)
  ) {
    return NextResponse.json(
      { error: "Missing or invalid image key." },
      { status: 400 },
    );
  }

  try {
    const [image] = await db
      .select({ id: testimonial_image.id })
      .from(testimonial_image)
      .where(eq(testimonial_image.image, key))
      .limit(1);

    if (!image) {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }

    await S3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
    await db.delete(testimonial_image).where(eq(testimonial_image.image, key));

    return NextResponse.json({ message: "Image deleted successfully." });
  } catch (error) {
    console.error("Failed to delete testimonial image:", error);
    return NextResponse.json(
      { error: "Failed to delete image." },
      { status: 500 },
    );
  }
}
