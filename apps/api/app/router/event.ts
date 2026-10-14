import { implement } from "@orpc/server";
import { and, asc, db, eq, gt, inArray } from "@repo/database";
import {
  event,
  event_minister,
  flyer,
  minister,
  reservation,
} from "@repo/database";
import { contract } from "../contract";
import {
  auth_middleware,
  BaseContext,
  optional_auth_middleware,
} from "./midddleware";

const os = implement(contract).$context<BaseContext>();

function event_output(
  data: typeof event.$inferSelect,
  flyers: (typeof flyer.$inferSelect)[],
  ministers: (typeof minister.$inferSelect)[],
) {
  return {
    ...data,
    time: data.time.toISOString().slice(11, 19),
    flyers,
    ministers,
  };
}

async function get_event_or_throw(id: string, errors: any) {
  const [found_event] = await db
    .select()
    .from(event)
    .where(eq(event.id, id))
    .limit(1);
  if (!found_event)
    throw errors.NOT_FOUND({
      data: { resource_type: "event", resource_id: String(id) },
    });

  const [flyers, minister_links] = await Promise.all([
    db.select().from(flyer).where(eq(flyer.eventId, id)),
    db.select().from(event_minister).where(eq(event_minister.eventId, id)),
  ]);
  const minister_ids = minister_links.map((link) => link.ministerId);
  const ministers = minister_ids.length
    ? await db.select().from(minister).where(inArray(minister.id, minister_ids))
    : [];

  return event_output(found_event, flyers, ministers);
}

export const create_event = os.event.create
  .use(auth_middleware)
  .handler(async ({ input }) => {
    const now = new Date();
    const [created_event] = await db
      .insert(event)
      .values({
        ...input,
        time: new Date(`1970-01-01T${input.time}.000Z`),
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    if (!created_event) throw new Error("The event was not created.");

    return event_output(created_event, [], []);
  });

export const get_event = os.event.get
  .use(optional_auth_middleware)
  .handler(async ({ input, errors }) => get_event_or_throw(input.id, errors));

export const list_events = os.event.list
  .use(optional_auth_middleware)
  .handler(async ({ input, errors }) => {
    const conditions = [];
    if (input.cursor) {
      conditions.push(gt(event.id, input.cursor));
    }
    const rows = await db
      .select()
      .from(event)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(event.id))
      .limit(input.limit + 1);

    const has_more = rows.length > input.limit;
    const page = rows.slice(0, input.limit);
    const page_outputs = await Promise.all(
      page.map((item) => get_event_or_throw(item.id, errors)),
    );

    return {
      events: page_outputs,
      total: await db.$count(event),
      next_cursor:
        has_more && page.length ? String(page[page.length - 1]!.id) : null,
    };
  });

export const update_event = os.event.update
  .use(auth_middleware)
  .handler(async ({ input, errors }) => {
    const { id, ...values } = input;
    const [updated_event] = await db
      .update(event)
      .set({
        ...values,
        time: new Date(`1970-01-01T${values.time}.000Z`),
        updatedAt: new Date(),
      })
      .where(eq(event.id, id))
      .returning();

    if (!updated_event)
      throw errors.NOT_FOUND({
        data: { resource_type: "event", resource_id: String(id) },
      });
    return get_event_or_throw(updated_event.id, errors);
  });

export const add_flyer = os.event.add_flyer
  .use(auth_middleware)
  .handler(async ({ input, errors }) => {
    await get_event_or_throw(input.eventId, errors);
    const now = new Date();
    const [created_flyer] = await db
      .insert(flyer)
      .values({ ...input, createdAt: now, updatedAt: now })
      .returning();
    if (!created_flyer) throw new Error("The flyer was not added.");
    return get_event_or_throw(input.eventId, errors);
  });

export const update_flyer = os.event.update_flyer
  .use(auth_middleware)
  .handler(async ({ input, errors }) => {
    const { id, ...values } = input;
    const [updated_flyer] = await db
      .update(flyer)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(flyer.id, id))
      .returning();
    if (!updated_flyer)
      throw errors.NOT_FOUND({
        data: { resource_type: "flyer", resource_id: String(id) },
      });
    return get_event_or_throw(updated_flyer.eventId, errors);
  });

export const add_minister = os.event.add_minister
  .use(auth_middleware)
  .handler(async ({ input, errors }) => {
    await get_event_or_throw(input.eventId, errors);
    const now = new Date();
    const [created_minister] = await db.transaction(async (tx) => {
      const [new_minister] = await tx
        .insert(minister)
        .values({
          firstName: input.firstName,
          lastName: input.lastName,
          title: input.title,
          image: input.image,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      if (!new_minister) return [undefined];

      await tx.insert(event_minister).values({
        eventId: input.eventId,
        ministerId: new_minister.id,
      });
      return [new_minister];
    });

    if (!created_minister) throw new Error("The minister was not added.");
    return get_event_or_throw(input.eventId, errors);
  });

export const update_minister = os.event.update_minister
  .use(auth_middleware)
  .handler(async ({ input, errors }) => {
    const [link] = await db
      .select()
      .from(event_minister)
      .where(
        and(
          eq(event_minister.eventId, input.eventId),
          eq(event_minister.ministerId, input.id),
        ),
      )
      .limit(1);
    if (!link)
      throw errors.NOT_FOUND({
        data: { resource_type: "minister", resource_id: String(input.id) },
      });

    const { id, eventId, ...values } = input;
    const [updated_minister] = await db
      .update(minister)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(minister.id, id))
      .returning();
    if (!updated_minister)
      throw errors.NOT_FOUND({
        data: { resource_type: "minister", resource_id: String(id) },
      });
    return get_event_or_throw(eventId, errors);
  });

export const create_reservation = os.event.create_reservation
  .use(optional_auth_middleware)
  .handler(async ({ input, errors }) => {
    await get_event_or_throw(input.eventId, errors);
    const now = new Date();
    const [created_reservation] = await db
      .insert(reservation)
      .values({ ...input, createdAt: now, updatedAt: now })
      .returning();
    if (!created_reservation) {
      throw new Error("The reservation was not created.");
    }
    return get_event_or_throw(input.eventId, errors);
  });

export const update_reservation = os.event.update_reservation
  .use(auth_middleware)
  .handler(async ({ input, errors }) => {
    const { id, ...values } = input;
    const [updated_reservation] = await db
      .update(reservation)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(reservation.id, id))
      .returning();
    if (!updated_reservation)
      throw errors.NOT_FOUND({
        data: { resource_type: "reservation", resource_id: String(id) },
      });
    return get_event_or_throw(updated_reservation.eventId, errors);
  });

export const delete_event = os.event.delete
  .use(auth_middleware)
  .handler(async ({ input, errors }) => {
    const deleted_event = await get_event_or_throw(input.id, errors);
    await db.transaction(async (tx) => {
      await tx.delete(flyer).where(eq(flyer.eventId, input.id));
      await tx.delete(reservation).where(eq(reservation.eventId, input.id));
      await tx
        .delete(event_minister)
        .where(eq(event_minister.eventId, input.id));
      await tx.delete(event).where(eq(event.id, input.id));
    });
    return deleted_event;
  });

export const delete_flyer = os.event.delete_flyer
  .use(auth_middleware)
  .handler(async ({ input, errors }) => {
    const [deleted_flyer] = await db
      .delete(flyer)
      .where(eq(flyer.id, input.id))
      .returning();
    if (!deleted_flyer)
      throw errors.NOT_FOUND({
        data: { resource_type: "flyer", resource_id: String(input.id) },
      });
    return get_event_or_throw(deleted_flyer.eventId, errors);
  });
