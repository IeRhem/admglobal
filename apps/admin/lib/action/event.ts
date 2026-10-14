"use server";

import {
  db,
  and,
  eq,
  inArray,
  event,
  flyer,
  minister,
  event_minister,
  reservation,
} from "@repo/database";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

async function requireAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user) {
    return null;
  }
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") {
    return null;
  }
  return session;
}

export async function createEventAction(data: {
  theme: string;
  startDate: string | Date;
  endDate: string | Date;
  time: string;
  location?: string;
  description?: string;
  desktopFlyer?: string;
  mobileFlyer?: string;
  badgeImage?: string;
  isRecurring?: boolean;
  recurringDays?: string[];
  hasMorningSession?: boolean;
  morningTime?: string;
  hasEveningSession?: boolean;
  eveningTime?: string;
  ministers?: Array<{
    firstName?: string;
    lastName?: string;
    title?: string;
    image?: string;
  }>;
}) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Admin access required." };
    }

    if (!data.theme || !data.theme.trim()) {
      return { success: false, error: "Event theme/title is required." };
    }
    if (!data.startDate || !data.endDate) {
      return { success: false, error: "Start and end dates are required." };
    }

    const now = new Date();
    const startDate = new Date(data.startDate);
    const endDate =
      typeof data.endDate === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(data.endDate.trim())
        ? new Date(`${data.endDate.trim()}T23:59:59.999Z`)
        : new Date(data.endDate);

    // Normalize time to a valid Date object for the timestamp column
    let timeDate: Date;
    if (data.time && /^\d{2}:\d{2}(:\d{2})?$/.test(data.time)) {
      const timeStr = data.time.length === 5 ? `${data.time}:00` : data.time;
      timeDate = new Date(`1970-01-01T${timeStr}.000Z`);
    } else if (data.time) {
      timeDate = new Date(data.time);
    } else {
      timeDate = new Date("1970-01-01T10:00:00.000Z");
    }

    let createdEventId: string | undefined;

    await db.transaction(async (tx) => {
      const [createdEvent] = await tx
        .insert(event)
        .values({
          theme: data.theme.trim(),
          startDate,
          endDate,
          time: timeDate,
          location: data.location?.trim() || null,
          description: data.description?.trim() || null,
          badgeImage: data.badgeImage?.trim() || null,
          isRecurring: Boolean(data.isRecurring),
          recurringDays: data.recurringDays || [],
          hasMorningSession: Boolean(data.hasMorningSession),
          morningTime: data.morningTime?.trim() || null,
          hasEveningSession: Boolean(data.hasEveningSession),
          eveningTime: data.eveningTime?.trim() || null,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      if (!createdEvent) {
        throw new Error("Failed to create event.");
      }
      createdEventId = createdEvent.id;

      // Insert desktop flyer if provided
      if (data.desktopFlyer?.trim()) {
        await tx.insert(flyer).values({
          eventId: createdEvent.id,
          image: data.desktopFlyer.trim(),
          type: "desktop",
          createdAt: now,
          updatedAt: now,
        });
      }

      // Insert mobile flyer if provided
      if (data.mobileFlyer?.trim()) {
        await tx.insert(flyer).values({
          eventId: createdEvent.id,
          image: data.mobileFlyer.trim(),
          type: "mobile",
          createdAt: now,
          updatedAt: now,
        });
      }

      // Insert and link ministers if provided
      if (data.ministers && data.ministers.length > 0) {
        for (const m of data.ministers) {
          if (m.firstName || m.lastName) {
            const [newMinister] = await tx
              .insert(minister)
              .values({
                firstName: m.firstName?.trim() || null,
                lastName: m.lastName?.trim() || null,
                title: m.title?.trim() || null,
                image: m.image?.trim() || null,
                createdAt: now,
                updatedAt: now,
              })
              .returning();

            if (newMinister) {
              await tx.insert(event_minister).values({
                eventId: createdEvent.id,
                ministerId: newMinister.id,
              });
            }
          }
        }
      }
    });

    if (!createdEventId) {
      return { success: false, error: "Failed to create event." };
    }

    revalidatePath("/events");
    return { success: true, eventId: createdEventId };
  } catch (error) {
    console.error("Failed to create event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create event.",
    };
  }
}

export async function updateEventAction(data: {
  id: string;
  theme: string;
  startDate: string | Date;
  endDate: string | Date;
  time: string;
  location?: string;
  description?: string;
  desktopFlyer?: string;
  mobileFlyer?: string;
  badgeImage?: string;
  isRecurring?: boolean;
  recurringDays?: string[];
  hasMorningSession?: boolean;
  morningTime?: string;
  hasEveningSession?: boolean;
  eveningTime?: string;
  ministers?: Array<{
    firstName?: string;
    lastName?: string;
    title?: string;
    image?: string;
  }>;
}) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Admin access required." };
    }

    if (!data.theme || !data.theme.trim()) {
      return { success: false, error: "Event theme/title is required." };
    }

    const startDate = new Date(data.startDate);
    const endDate =
      typeof data.endDate === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(data.endDate.trim())
        ? new Date(`${data.endDate.trim()}T23:59:59.999Z`)
        : new Date(data.endDate);

    let timeDate: Date;
    if (data.time && /^\d{2}:\d{2}(:\d{2})?$/.test(data.time)) {
      const timeStr = data.time.length === 5 ? `${data.time}:00` : data.time;
      timeDate = new Date(`1970-01-01T${timeStr}.000Z`);
    } else if (data.time) {
      timeDate = new Date(data.time);
    } else {
      timeDate = new Date("1970-01-01T10:00:00.000Z");
    }

    const now = new Date();

    await db.transaction(async (tx) => {
      await tx
        .update(event)
        .set({
          theme: data.theme.trim(),
          startDate,
          endDate,
          time: timeDate,
          location: data.location?.trim() || null,
          description: data.description?.trim() || null,
          ...(data.badgeImage !== undefined
            ? { badgeImage: data.badgeImage.trim() || null }
            : {}),
          ...(data.isRecurring !== undefined
            ? { isRecurring: Boolean(data.isRecurring) }
            : {}),
          ...(data.recurringDays !== undefined
            ? { recurringDays: data.recurringDays }
            : {}),
          ...(data.hasMorningSession !== undefined
            ? { hasMorningSession: Boolean(data.hasMorningSession) }
            : {}),
          ...(data.morningTime !== undefined
            ? { morningTime: data.morningTime.trim() || null }
            : {}),
          ...(data.hasEveningSession !== undefined
            ? { hasEveningSession: Boolean(data.hasEveningSession) }
            : {}),
          ...(data.eveningTime !== undefined
            ? { eveningTime: data.eveningTime.trim() || null }
            : {}),
          updatedAt: now,
        })
        .where(eq(event.id, data.id));

      // Handle desktop flyer update
      if (data.desktopFlyer !== undefined) {
        const [existingDesktop] = await tx
          .select()
          .from(flyer)
          .where(and(eq(flyer.eventId, data.id), eq(flyer.type, "desktop")))
          .limit(1);

        if (data.desktopFlyer.trim()) {
          if (existingDesktop) {
            await tx
              .update(flyer)
              .set({ image: data.desktopFlyer.trim(), updatedAt: now })
              .where(eq(flyer.id, existingDesktop.id));
          } else {
            await tx.insert(flyer).values({
              eventId: data.id,
              image: data.desktopFlyer.trim(),
              type: "desktop",
              createdAt: now,
              updatedAt: now,
            });
          }
        } else if (existingDesktop) {
          await tx.delete(flyer).where(eq(flyer.id, existingDesktop.id));
        }
      }

      // Handle mobile flyer update
      if (data.mobileFlyer !== undefined) {
        const [existingMobile] = await tx
          .select()
          .from(flyer)
          .where(and(eq(flyer.eventId, data.id), eq(flyer.type, "mobile")))
          .limit(1);

        if (data.mobileFlyer.trim()) {
          if (existingMobile) {
            await tx
              .update(flyer)
              .set({ image: data.mobileFlyer.trim(), updatedAt: now })
              .where(eq(flyer.id, existingMobile.id));
          } else {
            await tx.insert(flyer).values({
              eventId: data.id,
              image: data.mobileFlyer.trim(),
              type: "mobile",
              createdAt: now,
              updatedAt: now,
            });
          }
        } else if (existingMobile) {
          await tx.delete(flyer).where(eq(flyer.id, existingMobile.id));
        }
      }

      // Handle ministers update
      if (data.ministers !== undefined) {
        if (
          data.ministers.length > 0 &&
          (data.ministers[0]?.firstName || data.ministers[0]?.lastName)
        ) {
          const m = data.ministers[0];
          const [existingRel] = await tx
            .select()
            .from(event_minister)
            .where(eq(event_minister.eventId, data.id))
            .limit(1);

          if (existingRel) {
            await tx
              .update(minister)
              .set({
                firstName: m.firstName?.trim() || null,
                lastName: m.lastName?.trim() || null,
                title: m.title?.trim() || null,
                image: m.image?.trim() || null,
                updatedAt: now,
              })
              .where(eq(minister.id, existingRel.ministerId));
          } else {
            const [newMin] = await tx
              .insert(minister)
              .values({
                firstName: m.firstName?.trim() || null,
                lastName: m.lastName?.trim() || null,
                title: m.title?.trim() || null,
                image: m.image?.trim() || null,
                createdAt: now,
                updatedAt: now,
              })
              .returning();

            if (newMin) {
              await tx.insert(event_minister).values({
                eventId: data.id,
                ministerId: newMin.id,
              });
            }
          }
        } else if (data.ministers.length === 0) {
          await tx
            .delete(event_minister)
            .where(eq(event_minister.eventId, data.id));
        }
      }
    });

    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    console.error("Failed to update event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update event",
    };
  }
}

export async function deleteEventAction(id: string) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Admin access required." };
    }

    await db.transaction(async (tx) => {
      await tx.delete(flyer).where(eq(flyer.eventId, id));
      await tx.delete(reservation).where(eq(reservation.eventId, id));
      await tx.delete(event_minister).where(eq(event_minister.eventId, id));
      await tx.delete(event).where(eq(event.id, id));
    });

    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete event",
    };
  }
}

export async function bulkDeleteEventsAction(ids: string[]) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Admin access required." };
    }

    if (!ids || ids.length === 0) return { success: true };

    await db.transaction(async (tx) => {
      await tx.delete(flyer).where(inArray(flyer.eventId, ids));
      await tx.delete(reservation).where(inArray(reservation.eventId, ids));
      await tx
        .delete(event_minister)
        .where(inArray(event_minister.eventId, ids));
      await tx.delete(event).where(inArray(event.id, ids));
    });

    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    console.error("Failed to bulk delete events:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to bulk delete",
    };
  }
}

export async function addFlyerAction(data: {
  eventId: string;
  image: string;
  type: "mobile" | "desktop";
}) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Admin access required." };
    }

    const now = new Date();
    await db.insert(flyer).values({
      eventId: data.eventId,
      image: data.image.trim(),
      type: data.type,
      createdAt: now,
      updatedAt: now,
    });

    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    console.error("Failed to add flyer:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add flyer",
    };
  }
}

export async function deleteFlyerAction(flyerId: string) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Admin access required." };
    }

    await db.delete(flyer).where(eq(flyer.id, flyerId));
    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete flyer:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete flyer",
    };
  }
}

export async function addMinisterAction(data: {
  eventId: string;
  firstName: string;
  lastName: string;
  title?: string;
  image?: string;
}) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Admin access required." };
    }

    const now = new Date();
    const [newMinister] = await db
      .insert(minister)
      .values({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        title: data.title?.trim() || null,
        image: data.image?.trim() || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (newMinister) {
      await db.insert(event_minister).values({
        eventId: data.eventId,
        ministerId: newMinister.id,
      });
    }

    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    console.error("Failed to add minister:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add minister",
    };
  }
}

export async function removeMinisterAction(
  eventId: string,
  ministerId: string,
) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Admin access required." };
    }

    await db
      .delete(event_minister)
      .where(
        and(
          eq(event_minister.eventId, eventId),
          eq(event_minister.ministerId, ministerId),
        ),
      );

    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    console.error("Failed to remove minister link:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to remove minister",
    };
  }
}
