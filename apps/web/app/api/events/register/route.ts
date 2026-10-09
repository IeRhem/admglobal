import { NextResponse } from "next/server";
import { eventRegistrationSchema } from "@/lib/schemas/event-registration";

export async function POST(request: Request) {
  const apiUrl = process.env.ADMI_API_URL;
  if (!apiUrl) {
    return NextResponse.json(
      { error: "ADMI_API_URL is required to register for events." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = eventRegistrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid registration details.", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { eventId, firstName, lastName, email, phone } = parsed.data;
  let apiResponse: Response;
  try {
    apiResponse = await fetch(
      new URL(`/api/events/${eventId}/reservations`, apiUrl),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: Number(eventId),
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
        }),
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to reach the event API." },
      { status: 502 },
    );
  }

  return new Response(await apiResponse.text(), {
    status: apiResponse.status,
    headers: {
      "Content-Type":
        apiResponse.headers.get("Content-Type") ?? "application/json",
    },
  });
}
