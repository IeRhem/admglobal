import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json({ error: "Missing image url parameter" }, { status: 400 });
  }

  try {
    const res = await fetch(imageUrl, {
      headers: {
        Accept: "image/*",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch upstream image: ${res.statusText}` },
        { status: res.status },
      );
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await res.arrayBuffer();

    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Access-Control-Allow-Origin": "*",
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
