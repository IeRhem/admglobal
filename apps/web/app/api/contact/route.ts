import { NextResponse } from "next/server";
import { forwardApiRequest } from "@/lib/api-proxy";
import { contactFormSchema } from "@/lib/schemas/contact";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid contact details.", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { type, firstName, lastName, email, phone, message } = parsed.data;
  return forwardApiRequest("/api/contacts", {
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    message,
    for: type === "inquiry" ? "general" : type,
  });
}
