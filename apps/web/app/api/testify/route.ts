import { NextResponse } from "next/server";
import { forwardApiRequest } from "@/lib/api-proxy";
import { testifyFormSchema } from "@/lib/schemas/testify";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = testifyFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid testimony details.", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { firstName, lastName, email, testimony } = parsed.data;
  return forwardApiRequest("/api/testimonials", {
    first_name: firstName,
    last_name: lastName,
    email,
    message: testimony,
  });
}
