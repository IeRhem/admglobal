"use server";

import {
  activity_log,
  db,
  eq,
  inArray,
  testimonial,
  testimonial_image,
} from "@repo/database";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserPageAccess } from "@/lib/branch-access";

async function requireTestimonyAccess() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return {
      authorized: false as const,
      error: "Unauthorized: Active session required.",
    };
  }

  if (session.user.role !== "admin") {
    const pages = await getUserPageAccess(session.user.id);
    if (pages.includes("/testimonies")) {
      return { authorized: true as const, session };
    }
    return {
      authorized: false as const,
      error: "Forbidden: Testimonies page access required.",
    };
  }

  return { authorized: true as const, session };
}

export async function toggleTestimonyVerification(
  id: string,
  isVerified: boolean,
) {
  try {
    const authResult = await requireTestimonyAccess();
    if (!authResult.authorized) {
      return {
        success: false,
        error: authResult.error,
      };
    }

    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(testimonial)
        .set({ isVerified, updatedAt: new Date() })
        .where(eq(testimonial.id, id))
        .returning({ id: testimonial.id });
      if (updated) {
        await tx.insert(activity_log).values({
          actorUserId: authResult.session.user.id,
          actorName: authResult.session.user.name,
          action: isVerified ? "testimony_verified" : "testimony_unverified",
          entityType: "testimony",
          entityId: updated.id,
          description: `${isVerified ? "Approved" : "Unpublished"} a testimony.`,
        });
      }
    });

    revalidatePath("/testimonies");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle testimony verification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update status",
    };
  }
}

export async function deleteTestimonyAction(id: string) {
  try {
    const authResult = await requireTestimonyAccess();
    if (!authResult.authorized) {
      return {
        success: false,
        error: authResult.error,
      };
    }

    await db.transaction(async (tx) => {
      const [existing] = await tx
        .select({
          firstName: testimonial.firstName,
          lastName: testimonial.lastName,
        })
        .from(testimonial)
        .where(eq(testimonial.id, id))
        .limit(1);
      await tx
        .delete(testimonial_image)
        .where(eq(testimonial_image.testimonialId, id));
      await tx.delete(testimonial).where(eq(testimonial.id, id));
      if (existing) {
        const name = [existing.firstName, existing.lastName]
          .filter(Boolean)
          .join(" ");
        await tx.insert(activity_log).values({
          actorUserId: authResult.session.user.id,
          actorName: authResult.session.user.name,
          action: "testimony_deleted",
          entityType: "testimony",
          entityId: id,
          description: `Deleted${name ? ` ${name}'s` : ""} testimony.`,
        });
      }
    });

    revalidatePath("/testimonies");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete testimony:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete testimony",
    };
  }
}

export async function createTestimonyAction(data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  message: string;
  isVerified?: boolean;
}) {
  try {
    const authResult = await requireTestimonyAccess();
    if (!authResult.authorized) {
      return {
        success: false,
        error: authResult.error,
      };
    }

    if (!data.message || data.message.trim().length < 10) {
      return {
        success: false,
        error: "Testimony message must be at least 10 characters long.",
      };
    }

    const now = new Date();
    const [inserted] = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(testimonial)
        .values({
          firstName: data.firstName?.trim() || null,
          lastName: data.lastName?.trim() || null,
          email: data.email?.trim() || null,
          message: data.message.trim(),
          isVerified: data.isVerified ?? false,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      if (created) {
        await tx.insert(activity_log).values({
          actorUserId: authResult.session.user.id,
          actorName: authResult.session.user.name,
          action: "testimony_created",
          entityType: "testimony",
          entityId: created.id,
          description: "Created a testimony.",
        });
      }
      return [created];
    });

    revalidatePath("/testimonies");
    return { success: true, data: inserted };
  } catch (error) {
    console.error("Failed to create testimony:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create testimony",
    };
  }
}

export async function bulkUpdateVerificationAction(
  ids: string[],
  isVerified: boolean,
) {
  try {
    const authResult = await requireTestimonyAccess();
    if (!authResult.authorized) {
      return {
        success: false,
        error: authResult.error,
      };
    }

    if (!ids.length) return { success: true };

    await db.transaction(async (tx) => {
      const updated = await tx
        .update(testimonial)
        .set({ isVerified, updatedAt: new Date() })
        .where(inArray(testimonial.id, ids))
        .returning({ id: testimonial.id });
      if (updated.length > 0) {
        await tx.insert(activity_log).values({
          actorUserId: authResult.session.user.id,
          actorName: authResult.session.user.name,
          action: "testimonies_bulk_updated",
          entityType: "testimony",
          description: `${isVerified ? "Approved" : "Unpublished"} ${updated.length} testimon${updated.length === 1 ? "y" : "ies"}.`,
        });
      }
    });

    revalidatePath("/testimonies");
    return { success: true };
  } catch (error) {
    console.error("Failed to bulk update testimonies:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to bulk update status",
    };
  }
}

export async function bulkDeleteTestimoniesAction(ids: string[]) {
  try {
    const authResult = await requireTestimonyAccess();
    if (!authResult.authorized) {
      return {
        success: false,
        error: authResult.error,
      };
    }

    if (!ids.length) return { success: true };

    await db.transaction(async (tx) => {
      await tx
        .delete(testimonial_image)
        .where(inArray(testimonial_image.testimonialId, ids));
      const deleted = await tx
        .delete(testimonial)
        .where(inArray(testimonial.id, ids))
        .returning({ id: testimonial.id });
      if (deleted.length > 0) {
        await tx.insert(activity_log).values({
          actorUserId: authResult.session.user.id,
          actorName: authResult.session.user.name,
          action: "testimonies_bulk_deleted",
          entityType: "testimony",
          description: `Deleted ${deleted.length} testimon${deleted.length === 1 ? "y" : "ies"}.`,
        });
      }
    });

    revalidatePath("/testimonies");
    return { success: true };
  } catch (error) {
    console.error("Failed to bulk delete testimonies:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to bulk delete",
    };
  }
}
