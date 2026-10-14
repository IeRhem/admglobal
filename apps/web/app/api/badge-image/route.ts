import { NextResponse } from "next/server";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

function isAllowedHost(target: URL): boolean {
  if (target.protocol !== "https:") {
    return false;
  }

  const allowedOrigins = [
    process.env.ADMI_API_URL,
    process.env.NEXT_PUBLIC_API_URL,
    process.env.INTERNAL_API_URL,
    process.env.R2_PUBLIC_HOST,
    process.env.R2_ENDPOINT_URL,
    "42b40677ea1da496602c65f13ca87f68.r2.cloudflarestorage.com",
    "admi.42b40677ea1da496602c65f13ca87f68.r2.cloudflarestorage.com",
  ].filter(Boolean) as string[];

  for (const origin of allowedOrigins) {
    try {
      const url = new URL(origin.startsWith("http") ? origin : `https://${origin}`);
      if (target.host === url.host) {
        return true;
      }
    } catch {
      // ignore malformed env var
    }
  }

  return false;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json(
      { error: "Missing image url parameter" },
      { status: 400 },
    );
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(imageUrl);
  } catch {
    return NextResponse.json(
      { error: "Invalid image url parameter" },
      { status: 400 },
    );
  }

  if (!isAllowedHost(targetUrl)) {
    return NextResponse.json(
      { error: "Image host is not allowed" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(targetUrl.toString(), {
      headers: {
        Accept: "image/*",
      },
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
    });

    if (res.status >= 300 && res.status < 400) {
      return NextResponse.json(
        { error: "Redirects are not allowed" },
        { status: 400 },
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch upstream image: ${res.statusText}` },
        { status: res.status },
      );
    }

    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Image size exceeds limit" },
        { status: 413 },
      );
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("image/")) {
      return NextResponse.json(
        { error: "Upstream response is not an image" },
        { status: 415 },
      );
    }

    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Image size exceeds limit" },
        { status: 413 },
      );
    }

    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Error proxying badge image:", error);
    return NextResponse.json(
      { error: "Internal error proxying badge image" },
      { status: 500 },
    );
  }
}
