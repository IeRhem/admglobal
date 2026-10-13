"use server"

import { db, eq, inArray, testimonial, testimonial_image } from "@repo/database"
import { revalidatePath } from "next/cache"

export async function toggleTestimonyVerification(
  id: string,
  isVerified: boolean
) {
  try {
    await db
      .update(testimonial)
      .set({ isVerified, updatedAt: new Date() })
      .where(eq(testimonial.id, id))

    revalidatePath("/testimonies")
    return { success: true }
  } catch (error) {
    console.error("Failed to toggle testimony verification:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update status",
    }
  }
}

export async function deleteTestimonyAction(id: string) {
  try {
    await db.transaction(async (tx) => {
      await tx
        .delete(testimonial_image)
        .where(eq(testimonial_image.testimonialId, id))
      await tx.delete(testimonial).where(eq(testimonial.id, id))
    })

    revalidatePath("/testimonies")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete testimony:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete testimony",
    }
  }
}

export async function createTestimonyAction(data: {
  firstName?: string
  lastName?: string
  email?: string
  message: string
  isVerified?: boolean
}) {
  try {
    if (!data.message || data.message.trim().length < 10) {
      return {
        success: false,
        error: "Testimony message must be at least 10 characters long.",
      }
    }

    const now = new Date()
    const [inserted] = await db
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
      .returning()

    revalidatePath("/testimonies")
    return { success: true, data: inserted }
  } catch (error) {
    console.error("Failed to create testimony:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create testimony",
    }
  }
}

export async function bulkUpdateVerificationAction(
  ids: string[],
  isVerified: boolean
) {
  try {
    if (!ids.length) return { success: true }

    await db
      .update(testimonial)
      .set({ isVerified, updatedAt: new Date() })
      .where(inArray(testimonial.id, ids))

    revalidatePath("/testimonies")
    return { success: true }
  } catch (error) {
    console.error("Failed to bulk update testimonies:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to bulk update status",
    }
  }
}

export async function bulkDeleteTestimoniesAction(ids: string[]) {
  try {
    if (!ids.length) return { success: true }

    await db.transaction(async (tx) => {
      await tx
        .delete(testimonial_image)
        .where(inArray(testimonial_image.testimonialId, ids))
      await tx.delete(testimonial).where(inArray(testimonial.id, ids))
    })

    revalidatePath("/testimonies")
    return { success: true }
  } catch (error) {
    console.error("Failed to bulk delete testimonies:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to bulk delete",
    }
  }
}
