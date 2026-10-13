import { and, db, eq, testimonial, testimonial_image } from "@repo/database";
import { NextResponse } from "next/server";
import { getPresignedUrl } from "@/lib/r2";

// Allowed key prefixes / characters - prevents directory traversal
const safeKeyPattern = /^(events|testimonials|badges|ministers)\/[a-zA-Z0-9_\-\.\/]+$/i;

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  if (!key || key.includes("..") || !safeKeyPattern.test(key)) {
    return NextResponse.json({ error: "Invalid image key." }, { status: 400 });
  }

  try {
    const presignedUrl = await getPresignedUrl(key, 3600);
    return NextResponse.redirect(presignedUrl, {
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  } catch (error) {
    console.error("Failed to create presigned image URL:", error);
    return NextResponse.json(
      { error: "Unable to load image." },
      { status: 500 },
    );
  }
}
