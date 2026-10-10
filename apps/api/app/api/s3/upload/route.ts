import {
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { db, eq, testimonial, testimonial_image } from "@repo/database";
import { v4 as uuidv4 } from "uuid";
import { S3 } from "@/lib/S3Client";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const imageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export async function POST(request: Request) {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) {
    return NextResponse.json(
      { error: "R2_BUCKET_NAME is required to upload images." },
      { status: 500 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart form data." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  const testimonialId = Number(formData.get("testimonialId"));
  if (
    !(file instanceof File) ||
    !Number.isInteger(testimonialId) ||
    testimonialId < 1
  ) {
    return NextResponse.json(
      { error: "A valid image file and testimonial ID are required." },
      { status: 400 },
    );
  }

  const extension = imageTypes[file.type as keyof typeof imageTypes];
  if (!extension) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, and WebP images are supported." },
      { status: 415 },
    );
  }
  if (file.size < 1 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Images must be no larger than 5 MB." },
      { status: 413 },
    );
  }

  const fileBytes = new Uint8Array(await file.arrayBuffer());
  const isValidImage =
    (file.type === "image/jpeg" &&
      fileBytes[0] === 0xff &&
      fileBytes[1] === 0xd8 &&
      fileBytes[2] === 0xff) ||
    (file.type === "image/png" &&
      fileBytes
        .slice(0, 8)
        .every((byte, index) => byte === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index])) ||
    (file.type === "image/webp" &&
      new TextDecoder().decode(fileBytes.slice(0, 4)) === "RIFF" &&
      new TextDecoder().decode(fileBytes.slice(8, 12)) === "WEBP");
  if (!isValidImage) {
    return NextResponse.json(
      { error: "The uploaded file is not a valid JPEG, PNG, or WebP image." },
      { status: 415 },
    );
  }

  try {
    const [parent] = await db
      .select({ id: testimonial.id })
      .from(testimonial)
      .where(eq(testimonial.id, testimonialId))
      .limit(1);

    if (!parent) {
      return NextResponse.json(
        { error: "Testimony not found." },
        { status: 404 },
      );
    }

    const key = `testimonials/${testimonialId}/${uuidv4()}.${extension}`;
    await S3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fileBytes,
        ContentType: file.type,
        ContentLength: file.size,
      }),
    );

    try {
      const now = new Date();
      const [image] = await db
        .insert(testimonial_image)
        .values({
          testimonial_id: testimonialId,
          image: key,
          created_at: now,
          updated_at: now,
        })
        .returning();

      if (!image) throw new Error("The image record was not created.");
      return NextResponse.json(image, { status: 201 });
    } catch (error) {
      await S3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
      throw error;
    }
  } catch (error) {
    console.error("Failed to upload and record testimonial image:", error);
    return NextResponse.json(
      { error: "Failed to upload image." },
      { status: 500 },
    );
  }
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,DELETE,PATCH,POST,PUT,OPTIONS",
      "Access-Control-Allow-Headers": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
