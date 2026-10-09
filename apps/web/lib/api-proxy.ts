import { NextResponse } from "next/server";

export async function forwardApiRequest(path: string, body: unknown) {
  const apiUrl = process.env.ADMI_API_URL;
  if (!apiUrl) {
    return NextResponse.json(
      { error: "ADMI_API_URL is required to submit this form." },
      { status: 500 },
    );
  }

  let response: Response;
  try {
    response = await fetch(new URL(path, apiUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach the API." },
      { status: 502 },
    );
  }

  return new Response(await response.text(), {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") ?? "application/json",
    },
  });
}
