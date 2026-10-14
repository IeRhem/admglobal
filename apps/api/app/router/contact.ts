import { implement } from "@orpc/server";
import { asc, db, eq, gt } from "@repo/database";
import { contact } from "@repo/database";
import { contract } from "../contract";
import {
  auth_middleware,
  BaseContext,
  optional_auth_middleware,
} from "./midddleware";

const os = implement(contract).$context<BaseContext>();

export const create_contact = os.contact.create
  .use(optional_auth_middleware)
  .handler(async ({ input }) => {
    const now = new Date();
    const [created_contact] = await db
      .insert(contact)
      .values({
        ...input,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (!created_contact) throw new Error("The contact was not created.");
    return created_contact;
  });

export const update_contact = os.contact.update
  .use(auth_middleware)
  .handler(async ({ input, errors }) => {
    const { id, ...values } = input;
    const [updated_contact] = await db
      .update(contact)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(contact.id, id))
      .returning();

    if (!updated_contact)
      throw errors.NOT_FOUND({
        data: { resource_type: "contact", resource_id: String(id) },
      });
    return updated_contact;
  });

export const delete_contact = os.contact.delete
  .use(auth_middleware)
  .handler(async ({ input, errors }) => {
    const [deleted_contact] = await db
      .delete(contact)
      .where(eq(contact.id, input.id))
      .returning();

    if (!deleted_contact)
      throw errors.NOT_FOUND({
        data: { resource_type: "contact", resource_id: String(input.id) },
      });
    return deleted_contact;
  });

export const list_contacts = os.contact.list
  .use(auth_middleware)
  .handler(async ({ input }) => {
    const conditions = [];
    if (input.cursor) {
      conditions.push(gt(contact.id, input.cursor));
    }

    const rows = await db
      .select()
      .from(contact)
      .where(conditions.length ? conditions[0] : undefined)
      .orderBy(asc(contact.id))
      .limit(input.limit + 1);
    const has_more = rows.length > input.limit;
    const contacts = rows.slice(0, input.limit);

    return {
      contacts,
      total: await db.$count(contact),
      next_cursor:
        has_more && contacts.length
          ? String(contacts[contacts.length - 1]!.id)
          : null,
    };
  });
