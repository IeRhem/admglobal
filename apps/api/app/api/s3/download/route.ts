import {
  and,
  db,
  eq,
  gt,
  session,
  testimonial,
  testimonial_image,
  user,
} from "@repo/database";
import { NextResponse } from "next/server";
import { getPresignedUrl } from "@/lib/r2";

// Allowed key prefixes / characters - prevents directory traversal
const safeKeyPattern =
  /^(events|testimonials|badges|ministers)\/[a-zA-Z0-9_\-\.\/]+$/i;

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  if (!key || key.includes("..") || !safeKeyPattern.test(key)) {
    return NextResponse.json({ error: "Invalid image key." }, { status: 400 });
  }

  try {
    if (key.startsWith("testimonials/")) {
      const [img] = await db
        .select({ isVerified: testimonial.isVerified })
        .from(testimonial_image)
        .innerJoin(
          testimonial,
          eq(testimonial_image.testimonialId, testimonial.id),
        )
        .where(eq(testimonial_image.image, key))
        .limit(1);

      if (!img || !img.isVerified) {
        return NextResponse.json(
          { error: "Image not found." },
          { status: 404 },
        );
      }
    }

    if (key.startsWith("badges/")) {
      const authHeader = request.headers.get("authorization");
      const cookieHeader = request.headers.get("cookie");

      if (!authHeader && !cookieHeader) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }

      let sessionData: {
        session?: { id: string; userId: string };
        user?: {
          id: string;
          role?: string;
          isApproved?: boolean;
          status?: string;
        };
      } | null = null;

      if (cookieHeader) {
        const authBaseUrl =
          process.env.BETTER_AUTH_URL ||
          (process.env.ADMI_API_URL
            ? new URL(process.env.ADMI_API_URL).origin
            : "http://localhost:3000");

        try {
          const res = await fetch(`${authBaseUrl}/api/auth/get-session`, {
            headers: {
              cookie: cookieHeader,
            },
          });
          if (res.ok) {
            sessionData = await res.json().catch(() => null);
          }
        } catch (error) {
          console.error(
            "Failed to validate cookie session with Better Auth:",
            error,
          );
        }
      } else if (authHeader?.toLowerCase().startsWith("bearer ")) {
        const token = authHeader.slice(7).trim();
        if (token) {
          const [validSession] = await db
            .select({ user_id: session.userId })
            .from(session)
            .where(
              and(eq(session.token, token), gt(session.expiresAt, new Date())),
            )
            .limit(1);

          if (validSession) {
            const [u] = await db
              .select()
              .from(user)
              .where(eq(user.id, validSession.user_id))
              .limit(1);

            if (u) {
              sessionData = {
                session: {
                  id: validSession.user_id,
                  userId: validSession.user_id,
                },
                user: u as {
                  id: string;
                  role?: string;
                  isApproved?: boolean;
                  status?: string;
                },
              };
            }
          }
        }
      }

      if (!sessionData?.session || !sessionData?.user) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }

      const sessionUser = sessionData.user;
      const isApprovedOrAdmin =
        sessionUser.role === "admin" ||
        sessionUser.status === "approved" ||
        sessionUser.isApproved === true;

      if (!isApprovedOrAdmin) {
        return NextResponse.json(
          {
            error: "Forbidden: Account awaiting approval or insufficient role.",
          },
          { status: 403 },
        );
      }
    }

    const presignedUrl = await getPresignedUrl(key, 3600);
    return NextResponse.redirect(presignedUrl, {
      headers: { "Cache-Control": "private, max-age=3000" },
    });
  } catch (error) {
    console.error("Failed to create presigned image URL:", error);
    return NextResponse.json(
      { error: "Unable to load image." },
      { status: 500 },
    );
  }
}
