"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db, eq, user } from "@repo/database";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { USER_ROLES } from "@/lib/users";

const userInputSchema = z.object({
  name: z.string().trim().min(1, "Enter a name.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  role: z.enum(USER_ROLES),
});

const roleInputSchema = z.object({
  userId: z.string().trim().min(1),
  role: z.enum(USER_ROLES),
});

type ActionResult = { success: true } | { success: false; error: string };

async function getAdminSession() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.user || session.user.role !== "admin") {
    return null;
  }

  return { requestHeaders, session };
}

export async function addUser(input: {
  name: string;
  email: string;
  role: string;
}): Promise<ActionResult> {
  const parsedInput = userInputSchema.safeParse(input);
  if (!parsedInput.success) {
    return {
      success: false,
      error: parsedInput.error.issues[0]?.message ?? "Invalid user details.",
    };
  }

  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return {
        success: false,
        error: "You must be an administrator to add users.",
      };
    }

    await auth.api.createUser({
      headers: adminSession.requestHeaders,
      body: {
        ...parsedInput.data,
        email: parsedInput.data.email.toLowerCase(),
      },
    });
    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to add user:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unable to add this user.",
    };
  }
}

export async function updateUserRole(input: {
  userId: string;
  role: string;
}): Promise<ActionResult> {
  const parsedInput = roleInputSchema.safeParse(input);
  if (!parsedInput.success) {
    return { success: false, error: "Choose a valid role." };
  }

  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return {
        success: false,
        error: "You must be an administrator to change roles.",
      };
    }

    const [targetUser] = await db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, parsedInput.data.userId))
      .limit(1);

    if (!targetUser) {
      return { success: false, error: "That user could not be found." };
    }

    if (
      adminSession.session.user.id === parsedInput.data.userId &&
      parsedInput.data.role !== "admin"
    ) {
      return {
        success: false,
        error: "You cannot remove your own administrator role.",
      };
    }

    if (targetUser.role === "admin" && parsedInput.data.role !== "admin") {
      const admins = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.role, "admin"));

      if (admins.length <= 1) {
        return {
          success: false,
          error: "At least one administrator must remain.",
        };
      }
    }

    await auth.api.setRole({
      headers: adminSession.requestHeaders,
      body: {
        userId: parsedInput.data.userId,
        role: parsedInput.data.role,
      },
    });
    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user role:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unable to update this role.",
    };
  }
}
