import { implement } from "@orpc/server";
import {
  and,
  asc,
  db,
  eq,
  gt,
  inArray,
  testimonial,
  testimonial_image,
} from "@repo/database";
import { contract } from "../contract";
import { auth_middleware, BaseContext, optional_auth_middleware } from "./midddleware";

const os = implement(contract).$context<BaseContext>();

async function get_testimonial_or_throw(id: number, errors: any) {
  const [found_testimonial] = await db
    .select()
    .from(testimonial)
    .where(eq(testimonial.id, id))
    .limit(1);

  if (!found_testimonial) {
    throw errors.NOT_FOUND({
      data: {
        resource_type: "testimonial",
        resource_id: String(id),
      },
    });
  }

  const images = await db
    .select()
    .from(testimonial_image)
    .where(eq(testimonial_image.testimonial_id, id));

  return { ...found_testimonial, images };
}

export const create_testimonial = os.testimonial.create.use(optional_auth_middleware).handler(
  async ({ input }) => {
    const now = new Date();
    const [created_testimonial] = await db
      .insert(testimonial)
      .values({
        ...input,
        created_at: now,
        updated_at: now,
      })
      .returning();

    if (!created_testimonial) {
      throw new Error("The testimonial was not created.");
    }

    return { ...created_testimonial, images: [] };
  },
);

export const add_testimonial_image = os.testimonial.add_image.use(optional_auth_middleware).handler(
  async ({ input, errors }) => {
    await get_testimonial_or_throw(input.testimonial_id, errors);

    const now = new Date();
    const [created_image] = await db
      .insert(testimonial_image)
      .values({
        ...input,
        created_at: now,
        updated_at: now,
      })
      .returning();

    if (!created_image) {
      throw new Error("The testimonial image was not added.");
    }

    return get_testimonial_or_throw(input.testimonial_id, errors);
  },
);

export const update_testimonial = os.testimonial.update.use(auth_middleware).handler(
  async ({ input, errors }) => {
    const { id, ...values } = input;
    const [updated_testimonial] = await db
      .update(testimonial)
      .set({ ...values, updated_at: new Date() })
      .where(eq(testimonial.id, id))
      .returning();

    if (!updated_testimonial) {
      throw errors.NOT_FOUND({
        data: {
          resource_type: "testimonial",
          resource_id: String(id),
        },
      });
    }

    const images = await db
      .select()
      .from(testimonial_image)
      .where(eq(testimonial_image.testimonial_id, id));

    return { ...updated_testimonial, images };
  },
);

export const delete_testimonial = os.testimonial.delete.use(auth_middleware).handler(
  async ({ input, errors }) => {
    const deleted_testimonial = await get_testimonial_or_throw(input.id, errors);

    await db.transaction(async (tx) => {
      await tx
        .delete(testimonial_image)
        .where(eq(testimonial_image.testimonial_id, input.id));
      await tx.delete(testimonial).where(eq(testimonial.id, input.id));
    });

    return deleted_testimonial;
  },
);

export const delete_testimonial_image = os.testimonial.delete_image.use(auth_middleware).handler(
  async ({ input, errors }) => {
    const [deleted_image] = await db
      .delete(testimonial_image)
      .where(eq(testimonial_image.id, input.id))
      .returning();

    if (!deleted_image) {
      throw errors.NOT_FOUND({
        data: {
          resource_type: "testimonial_image",
          resource_id: String(input.id),
        },
      });
    }

    return get_testimonial_or_throw(deleted_image.testimonial_id, errors);
  },
);

export const get_testimonial = os.testimonial.get.use(optional_auth_middleware).handler(async ({ input, errors }) =>
  get_testimonial_or_throw(input.id, errors),
);

export const list_testimonies = os.testimonial.list.use(optional_auth_middleware).handler(
  async ({ input }) => {
    const filters = [eq(testimonial.is_verified, input.is_verified)];
    if (input.cursor !== null) {
      filters.push(gt(testimonial.id, Number(input.cursor)));
    }

    const where = and(...filters);
    const rows = await db
      .select()
      .from(testimonial)
      .where(where)
      .orderBy(asc(testimonial.id))
      .limit(input.limit + 1);

    const has_more = rows.length > input.limit;
    const page = rows.slice(0, input.limit);
    const page_ids = page.map(({ id }) => id);
    const images = page_ids.length
      ? await db
          .select()
          .from(testimonial_image)
          .where(inArray(testimonial_image.testimonial_id, page_ids))
      : [];

    const images_by_testimonial = new Map<number, typeof images>();
    for (const image of images) {
      const testimonial_images =
        images_by_testimonial.get(image.testimonial_id) ?? [];
      testimonial_images.push(image);
      images_by_testimonial.set(image.testimonial_id, testimonial_images);
    }

    return {
      testimonies: page.map((item) => ({
        ...item,
        images: images_by_testimonial.get(item.id) ?? [],
      })),
      total: await db.$count(
        testimonial,
        eq(testimonial.is_verified, input.is_verified),
      ),
      next_cursor:
        has_more && page.length > 0
          ? String(page[page.length - 1]!.id)
          : null,
    };
  },
);
